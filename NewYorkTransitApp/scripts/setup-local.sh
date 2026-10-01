#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-local.sh
#
# Install all dependencies and prepare the local dev environment.
# Run once after cloning the repo.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     NYC Transit Alerts — Local Setup                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Node version check ─────────────────────────────────────────────────────────
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [[ "$NODE_VERSION" -lt 20 ]]; then
  echo "❌ Node.js 20+ required. Current: $(node --version 2>/dev/null || echo 'not found')" >&2
  echo "   Install with: brew install node" >&2
  exit 1
fi
echo "✅ Node.js $(node --version)"

# ── Frontend deps ──────────────────────────────────────────────────────────────
echo ""
echo "📦 Installing frontend dependencies..."
cd "${ROOT}/frontend"
npm install
echo "✅ Frontend ready"

# ── Backend deps ──────────────────────────────────────────────────────────────
echo ""
echo "📦 Installing backend dependencies..."
cd "${ROOT}/backend"
npm install

cd "${ROOT}/backend/layers/shared/nodejs"
npm install
echo "✅ Backend ready"

# ── Copy env file ──────────────────────────────────────────────────────────────
if [[ ! -f "${ROOT}/frontend/.env.local" ]]; then
  cp "${ROOT}/frontend/.env.example" "${ROOT}/frontend/.env.local"
  echo ""
  echo "📝 Created frontend/.env.local from .env.example"
  echo "   Edit it to set your API URL (or leave VITE_USE_MOCK=true for mock data)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "   Start the frontend dev server:"
echo "   cd frontend && npm run dev"
echo ""
echo "   Deploy the backend:"
echo "   ./scripts/deploy-backend.sh dev YOUR_MTA_API_KEY"
echo ""
