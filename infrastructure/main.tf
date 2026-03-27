terraform {
  required_version = "~> 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.5"
    }
  }

  backend "s3" {
    bucket         = "juiceco-terraform-state"
    region         = "us-east-1"
    dynamodb_table = "juiceco-terraform-locks"
    encrypt        = true
    # key is provided via -backend-config in CI:
    #   key=augustine-home-improvements/production/terraform.tfstate
  }
}

provider "aws" {
  region = "us-east-1"

  assume_role {
    role_arn = var.deployer_role_arn
  }

  default_tags {
    tags = {
      Project     = "augustine-home-improvements"
      Environment = var.environment
      ManagedBy   = "terraform"
      Repo        = "Juiceco-io/augustine-home-improvements"
    }
  }
}
