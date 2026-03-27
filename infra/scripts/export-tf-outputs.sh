#!/usr/bin/env bash
# ============================================================
# export-tf-outputs.sh
# ============================================================
# Reads Terraform outputs from infra/terraform/ and writes
# them to GITHUB_OUTPUT (and GITHUB_ENV when needed for later
# steps in the same job).
#
# Designed to run after `terraform init` + `terraform output`
# inside a GitHub Actions step.
#
# Usage:
#   bash infra/scripts/export-tf-outputs.sh [environment]
#
# Each output is exported as both a step output and an env var.
# The caller workflow references them as:
#   ${{ steps.tf-outputs.outputs.cloudfront_url }}
# ============================================================

set -euo pipefail

TF_DIR="infra/terraform"

tf_out() {
  # Returns empty string if the output key doesn't exist yet.
  terraform -chdir="$TF_DIR" output -raw "$1" 2>/dev/null || echo ""
}

export_kv() {
  local key="$1"
  local val="$2"
  if [[ -n "$val" ]]; then
    echo "${key}=${val}" >> "$GITHUB_OUTPUT"
    echo "${key}=${val}" >> "$GITHUB_ENV"
    echo "  ✓ ${key} = ${val}"
  else
    echo "  ⚠ ${key} is empty (resource not yet provisioned)"
  fi
}

echo "=== Reading Terraform outputs ==="

export_kv "cloudfront_url"              "$(tf_out cloudfront_url)"
export_kv "cloudfront_distribution_id"  "$(tf_out cloudfront_distribution_id)"
export_kv "contact_api_url"             "$(tf_out contact_api_url)"
export_kv "cognito_user_pool_id"        "$(tf_out cognito_user_pool_id)"
export_kv "cognito_app_client_id"       "$(tf_out cognito_app_client_id)"
export_kv "cognito_domain"              "$(tf_out cognito_domain)"
export_kv "ecr_registry"                "$(tf_out ecr_registry)"
export_kv "ecr_repository_url"          "$(tf_out ecr_repository_url)"
export_kv "ecs_cluster_name"            "$(tf_out ecs_cluster_name)"
export_kv "ecs_service_name"            "$(tf_out ecs_service_name)"
export_kv "github_actions_role_arn"     "$(tf_out github_actions_role_arn)"

echo "=== Done ==="
