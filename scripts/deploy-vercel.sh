#!/usr/bin/env bash
# Deploy spotloop (myspot-app) to Vercel — einmalig: npx vercel login
set -euo pipefail
export PATH="${HOME}/.local/node/bin:${PATH}"
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "❌ .env.local fehlt. Kopiere .env.example und trage Supabase-Keys ein."
  exit 1
fi

# Env aus .env.local für Production-Build auf Vercel setzen
set -a
# shellcheck disable=SC1091
source .env.local
set +a

echo "📦 Build lokal…"
npm run build

echo "🚀 Deploy zu Vercel (Production)…"
npx vercel@latest deploy --prod \
  --env "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" \
  --env "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}"

echo ""
echo "✅ Nach dem Deploy in Supabase eintragen:"
echo "   Authentication → URL Configuration"
echo "   Site URL + Redirect URLs = deine Vercel-URL (z. B. https://spotloop.vercel.app)"
