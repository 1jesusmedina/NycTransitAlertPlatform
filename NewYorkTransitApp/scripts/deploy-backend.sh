#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-backend.sh
#
# Builds and deploys the SAM backend stack to AWS.
#
# Usage:
#   ./scripts/deploy-backend.sh [environment] [mta-api-key]
#
# Examples:
#   ./scripts/deploy-backend.sh prod  sk-my-mta-key-here
#   ./scripts/deploy-backend.sh dev   sk-my-mta-key-here
#   ./scripts/deploy-backend.sh staging
#
# Prerequisites:
#   - AWS CLI configured (aws configure or environment variables)
#   - AWS SAM CLI installed (brew install aws-sam-cli)
#   - Node.js 20+
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INFRA_DIR="${ROOT}/infrastructure"

ENV="${1:-prod}"
MTA_KEY="${2:-}"

# Validate environment
if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
  echo "❌ Invalid environment: $ENV. Must be dev, staging, or prod." >&2
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         NYC Transit Alerts — Backend Deploy              ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Environment : ${ENV}"
echo "║  Region      : ${AWS_DEFAULT_REGION:-us-east-1}"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Check prerequisites ────────────────────────────────────────────────────────
check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ Required tool not found: $1" >&2
    echo "   Install with: $2" >&2
    exit 1
  fi
}

check_cmd aws     "brew install awscli"
check_cmd sam     "brew install aws-sam-cli"
check_cmd node    "brew install node"

echo "✅ Prerequisites OK"

# ── Build shared Lambda layer ──────────────────────────────────────────────────
echo ""
echo "📦 Building shared Lambda layer..."
cd "${ROOT}/backend/layers/shared/nodejs"
npm install --silent
cd "${ROOT}/backend"
npm install --silent
echo "✅ Layer built"

# ── SAM build ─────────────────────────────────────────────────────────────────
echo ""
echo "🔨 Running sam build..."
cd "${INFRA_DIR}"
sam build \
  --template-file template.yaml \
  --parallel \
  --cached

echo "✅ SAM build complete"

# ── SAM deploy ────────────────────────────────────────────────────────────────
echo ""
echo "🚀 Deploying to AWS (${ENV})..."

PARAM_OVERRIDES="Environment=${ENV}"
if [[ -n "$MTA_KEY" ]]; then
  PARAM_OVERRIDES="${PARAM_OVERRIDES} MtaApiKey=${MTA_KEY}"
fi

sam deploy \
  --config-file samconfig.toml \
  --config-env "${ENV}" \
  --parameter-overrides "${PARAM_OVERRIDES}" \
  --no-fail-on-empty-changeset

echo ""
echo "✅ Backend deployed!"
echo ""

# ── Print API URL ──────────────────────────────────────────────────────────────
STACK_NAME="nyc-transit-alerts-${ENV}"
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" \
  --output text 2>/dev/null || echo "")

if [[ -n "$API_URL" ]]; then
  echo "🌐 API Base URL: ${API_URL}"
  echo ""
  echo "   Add to frontend .env.local:"
  echo "   VITE_API_BASE_URL=${API_URL}"
  echo ""
fi
