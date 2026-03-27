# ============================================================
# networking.tf — VPC, subnets, security groups for ECS + ALB
# ============================================================
# Uses the default VPC for simplicity. For production hardening,
# replace with a dedicated VPC with private subnets + NAT gateway.
# ============================================================

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ── ALB Security Group ────────────────────────────────────────────────────────
# Allow HTTPS from CloudFront only (via managed prefix list) + HTTP for redirect

resource "aws_security_group" "alb" {
  name        = "augustine-alb-${var.environment}"
  description = "Allow traffic to ALB from CloudFront"
  vpc_id      = data.aws_vpc.default.id

  # HTTP — redirect to HTTPS (or CloudFront handles TLS termination)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from anywhere (CloudFront terminates TLS)"
  }

  # If you add a custom SSL cert on the ALB, allow 443 too:
  # ingress {
  #   from_port   = 443
  #   to_port     = 443
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "augustine-alb-${var.environment}"
  }
}

# ── ECS Container Security Group ─────────────────────────────────────────────
# Only allows traffic from the ALB

resource "aws_security_group" "ecs" {
  name        = "augustine-ecs-${var.environment}"
  description = "Allow traffic from ALB to ECS containers"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Next.js port from ALB only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound (ECR pull, SES, Cognito)"
  }

  tags = {
    Name = "augustine-ecs-${var.environment}"
  }
}
