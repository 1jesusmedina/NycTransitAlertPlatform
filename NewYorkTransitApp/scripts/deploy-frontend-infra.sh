#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-frontend-infra.sh
#
# Deploys the S3 + CloudFront CloudFormation stack (frontend.yaml).
# Run this once before running deploy-frontend.sh.
#
# Usage:
#   ./scripts/deploy-frontend-infra.sh [environment] [api-base-url]
#
# Example:
#   ./scripts/deploy-frontend-infra.sh prod https://abc123.execute-api.us-east-1.amazonaws.com/prod
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ENV="${1:-prod}"
API_URL="${2:-}"
STACK_NAME="nyc-transit-frontend-${ENV}"

echo ""
echo "🏗️  Deploying frontend infrastructure (S3 + CloudFront)..."
echo "   Stack: ${STACK_NAME}"
echo "   Environment: ${ENV}"
echo ""

aws cloudformation deploy \
  --template-file "${ROOT}/infrastructure/frontend.yaml" \
  --stack-name "${STACK_NAME}" \
  --parameter-overrides \
    "Environment=${ENV}" \
    "ApiBaseUrl=${API_URL}" \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

echo ""
echo "✅ Frontend infrastructure deployed!"
echo ""

# Print outputs
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs" \
  --output table
