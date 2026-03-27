# ============================================================
# iam.tf — IAM roles for GitHub Actions (OIDC) and ECS tasks
# ============================================================

# ── GitHub Actions OIDC ──────────────────────────────────────────────────────

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# If the OIDC provider doesn't exist yet, uncomment and apply first:
# resource "aws_iam_openid_connect_provider" "github" {
#   url             = "https://token.actions.githubusercontent.com"
#   client_id_list  = ["sts.amazonaws.com"]
#   thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
# }

data "aws_iam_policy_document" "github_actions_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "augustine-github-actions-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume.json

  tags = {
    Name = "augustine-github-actions-${var.environment}"
  }
}

data "aws_iam_policy_document" "github_actions_permissions" {
  # ECR: login, push images
  statement {
    sid    = "ECRAuth"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ECRPush"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
    ]
    resources = [aws_ecr_repository.main.arn]
  }

  # ECS: deploy service
  statement {
    sid    = "ECSDeployService"
    effect = "Allow"
    actions = [
      "ecs:DescribeServices",
      "ecs:UpdateService",
      "ecs:RegisterTaskDefinition",
      "ecs:DeregisterTaskDefinition",
      "ecs:DescribeTaskDefinition",
      "ecs:ListTaskDefinitions",
    ]
    resources = ["*"]
  }

  # IAM: pass role to ECS task
  statement {
    sid     = "PassECSTaskRole"
    effect  = "Allow"
    actions = ["iam:PassRole"]
    resources = [
      aws_iam_role.ecs_task_execution.arn,
      aws_iam_role.ecs_task.arn,
    ]
  }

  # CloudFront: invalidate cache
  statement {
    sid    = "CloudFrontInvalidate"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetDistribution",
    ]
    resources = [aws_cloudfront_distribution.main.arn]
  }

  # Lambda: update contact handler
  statement {
    sid    = "LambdaUpdateContact"
    effect = "Allow"
    actions = [
      "lambda:UpdateFunctionCode",
      "lambda:GetFunction",
    ]
    resources = [aws_lambda_function.contact.arn]
  }

  # Terraform state backend (S3 + DynamoDB lock)
  statement {
    sid    = "TerraformStateBucket"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    # Update the bucket name to match your actual TF state bucket
    resources = [
      "arn:aws:s3:::augustine-tfstate",
      "arn:aws:s3:::augustine-tfstate/*",
    ]
  }

  statement {
    sid    = "TerraformStateLock"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/augustine-tfstate-lock",
    ]
  }
}

resource "aws_iam_role_policy" "github_actions_permissions" {
  name   = "augustine-github-actions-permissions"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions_permissions.json
}

# ── ECS Task Execution Role ──────────────────────────────────────────────────
# Allows ECS agent to pull images from ECR and write logs to CloudWatch

resource "aws_iam_role" "ecs_task_execution" {
  name = "augustine-ecs-execution-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ── ECS Task Role ──────────────────────────────────────────────────────────
# Permissions the Next.js container itself needs at runtime

resource "aws_iam_role" "ecs_task" {
  name = "augustine-ecs-task-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

# ── Lambda Execution Role ─────────────────────────────────────────────────────

resource "aws_iam_role" "lambda_contact" {
  name = "augustine-lambda-contact-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_contact.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "lambda_ses" {
  statement {
    sid    = "SESSend"
    effect = "Allow"
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail",
    ]
    resources = [
      # Restrict to the verified SES identity
      "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/${var.ses_from_email}",
    ]
  }
}

resource "aws_iam_role_policy" "lambda_ses" {
  name   = "augustine-lambda-ses"
  role   = aws_iam_role.lambda_contact.id
  policy = data.aws_iam_policy_document.lambda_ses.json
}
