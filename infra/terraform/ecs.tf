# ============================================================
# ecs.tf — ECS Fargate cluster, ALB, task definition, service
# ============================================================

locals {
  app_name  = "augustine-home-improvements"
  app_port  = 3000
  # Image tag is updated per deploy via `aws ecs update-service`
  # The actual tag is injected at deploy time by the CI workflow.
  image_uri = "${aws_ecr_repository.main.repository_url}:latest"
}

# ── Application Load Balancer ─────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "augustine-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name = "augustine-alb-${var.environment}"
  }
}

resource "aws_lb_target_group" "web" {
  name        = "augustine-web-${var.environment}"
  port        = local.app_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip" # Required for Fargate

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }

  tags = {
    Name = "augustine-web-${var.environment}"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # Forward to ECS; CloudFront handles TLS termination upstream.
  # To add HTTPS directly on ALB, add a second listener with ACM cert.
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# ── CloudWatch Log Group ──────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/augustine-${var.environment}"
  retention_in_days = 30
}

# ── ECS Cluster ───────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "augustine-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# ── ECS Task Definition ───────────────────────────────────────────────────────
# NOTE: Secrets (ADMIN_SESSION_SECRET, ISR_REVALIDATION_SECRET) are injected at
# deploy time via `aws ecs update-service --task-definition`. They must be stored
# in AWS Secrets Manager or SSM Parameter Store and referenced by ARN/path here.
# The placeholders below reference SSM parameters that must be created before
# first deploy.

resource "aws_ecs_task_definition" "web" {
  family                   = "augustine-web-${var.environment}"
  cpu                      = "512"
  memory                   = "1024"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = local.image_uri
      essential = true

      portMappings = [{
        containerPort = local.app_port
        hostPort      = local.app_port
        protocol      = "tcp"
      }]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(local.app_port) },
        { name = "HOSTNAME", value = "0.0.0.0" },
        # Non-sensitive config — set from Terraform outputs
        { name = "COGNITO_USER_POOL_ID",    value = aws_cognito_user_pool.main.id },
        { name = "COGNITO_APP_CLIENT_ID",   value = aws_cognito_user_pool_client.main.id },
        { name = "COGNITO_DOMAIN",          value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com" },
        { name = "NEXT_PUBLIC_CONTACT_API_URL", value = "${aws_apigatewayv2_api.contact.api_endpoint}/contact" },
      ]

      secrets = [
        # These SSM parameters must be created before first deploy:
        #   /augustine/<env>/admin-session-secret
        #   /augustine/<env>/isr-revalidation-secret
        {
          name      = "ADMIN_SESSION_SECRET"
          valueFrom = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/augustine/${var.environment}/admin-session-secret"
        },
        {
          name      = "ISR_REVALIDATION_SECRET"
          valueFrom = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/augustine/${var.environment}/isr-revalidation-secret"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "web"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${local.app_port}/ || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# ── ECS Service ───────────────────────────────────────────────────────────────

resource "aws_ecs_service" "web" {
  name            = "augustine-web-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.environment == "production" ? 2 : 1

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true # Required for default VPC without NAT
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = local.app_port
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  # Allow GitHub Actions to force new deployments without TF state drift
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [aws_lb_listener.http]
}

# ── SSM Parameter Store: IAM access for ECS task execution ───────────────────
# The task execution role needs permission to read the SSM secrets.

data "aws_iam_policy_document" "ecs_execution_ssm" {
  statement {
    sid    = "SSMReadSecrets"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/augustine/${var.environment}/*",
    ]
  }
}

resource "aws_iam_role_policy" "ecs_execution_ssm" {
  name   = "augustine-ecs-ssm-${var.environment}"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.ecs_execution_ssm.json
}
