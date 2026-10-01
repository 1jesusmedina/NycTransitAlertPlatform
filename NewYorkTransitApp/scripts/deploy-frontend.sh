#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-frontend.sh
#
# Builds the React app and syncs it to S3, then invalidates CloudFront.
#
# Usage:
#   ./scripts/deploy-frontend.sh [environment] [api-base-url]
#
# Examples:
#   ./scripts/deploy-frontend.sh prod  https://abc123.execute-api.us-east-1.amazonaws.com/prod
#   ./scripts/deploy-frontend.sh dev
#
# Prerequisites:
#   - AWS CLI configured
#   - Frontend stack already deployed (run deploy-frontend-infra.sh first)
#   - Node.js 20+ and npm
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${ROOT}/frontend"

ENV="${1:-prod}"
API_URL="${2:-}"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       NYC Transit Alerts — Frontend Deploy               ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Environment : ${ENV}"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ Required tool not found: $1" >&2
    exit 1
  fi
}
check_cmd aws
check_cmd node
check_cmd npm

# ── Fetch infra outputs from CloudFormation ────────────────────────────────────
BACKEND_STACK="nyc-transit-alerts-${ENV}"
FRONTEND_STACK="nyc-transit-frontend-${ENV}"

get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$1" \
    --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" \
    --output text 2>/dev/null || echo ""
}

# Use passed API URL or try to read from backend stack
if [[ -z "$API_URL" ]]; then
  API_URL=$(get_output "${BACKEND_STACK}" "ApiBaseUrl")
fi

BUCKET_NAME=$(get_output "${FRONTEND_STACK}" "BucketName")
CF_DIST_ID=$(get_output "${FRONTEND_STACK}" "CloudFrontDistributionId")
CF_DOMAIN=$(get_output "${FRONTEND_STACK}" "CloudFrontDomain")

if [[ -z "$BUCKET_NAME" ]]; then
  echo "❌ Could not find S3 bucket from stack ${FRONTEND_STACK}." >&2
  echo "   Run: ./scripts/deploy-frontend-infra.sh ${ENV}" >&2
  exit 1
fi

echo "📦 S3 Bucket:    ${BUCKET_NAME}"
echo "🌐 API Base URL: ${API_URL:-not set}"
echo "☁️  CloudFront:  ${CF_DOMAIN:-unknown}"
echo ""

# ── Write .env.production ──────────────────────────────────────────────────────
ENV_FILE="${FRONTEND_DIR}/.env.production"
cat > "${ENV_FILE}" <<EOF
VITE_API_BASE_URL=${API_URL}
VITE_USE_MOCK=false
EOF
echo "✅ Wrote ${ENV_FILE}"

# ── npm install + build ────────────────────────────────────────────────────────
echo ""
echo "🔨 Installing dependencies..."
cd "${FRONTEND_DIR}"
npm install --silent

echo "🏗️  Building React app..."
npm run build

echo "✅ Build complete (dist/)"

# ── Sync to S3 ────────────────────────────────────────────────────────────────
echo ""
echo "⬆️  Syncing to s3://${BUCKET_NAME}..."

# Long-lived assets (hashed filenames)
aws s3 sync dist/ "s3://${BUCKET_NAME}/" \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete \
  --quiet

# index.html — never cache
aws s3 cp dist/index.html "s3://${BUCKET_NAME}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8"

echo "✅ S3 sync complete"

# ── CloudFront invalidation ────────────────────────────────────────────────────
if [[ -n "$CF_DIST_ID" ]]; then
  echo ""
  echo "🔄 Invalidating CloudFront cache..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "${CF_DIST_ID}" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)
  echo "✅ Invalidation created: ${INVALIDATION_ID}"
fi

echo ""
echo "🎉 Frontend deployed!"
if [[ -n "$CF_DOMAIN" ]]; then
  echo "   URL: https://${CF_DOMAIN}"
fi
