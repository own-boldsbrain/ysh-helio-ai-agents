#!/usr/bin/env bash
set -euo pipefail

# setup-local.sh: Convenience script for setting up local development
# - Copies .env.local.example to .env.local if missing
# - Generates JWE_SECRET and ENCRYPTION_KEY if missing
# - Starts local Postgres container
# - Installs dependencies and runs database setup

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
ENV_EXAMPLE="$ROOT_DIR/.env.local.example"
ENV_LOCAL="$ROOT_DIR/.env.local"

echo "Setting up local development environment..."

if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "ERROR: Example env file not found: $ENV_EXAMPLE"
  exit 1
fi

if [ -f "$ENV_LOCAL" ]; then
  echo ".env.local already exists. Use --force to overwrite."
else
  echo "Copying $ENV_EXAMPLE -> $ENV_LOCAL"
  cp "$ENV_EXAMPLE" "$ENV_LOCAL"
fi

if ! grep -q '^JWE_SECRET=' "$ENV_LOCAL"; then
  echo "Generating JWE_SECRET..."
  JWE_SECRET=$(openssl rand -base64 32)
  echo "JWE_SECRET=$JWE_SECRET" >> "$ENV_LOCAL"
else
  echo "JWE_SECRET already present in $ENV_LOCAL"
fi

if ! grep -q '^ENCRYPTION_KEY=' "$ENV_LOCAL"; then
  echo "Generating ENCRYPTION_KEY..."
  ENCRYPTION_KEY=$(openssl rand -hex 32)
  echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> "$ENV_LOCAL"
else
  echo "ENCRYPTION_KEY already present in $ENV_LOCAL"
fi

echo "Starting Postgres container (docker-compose.dev.yml) ..."
docker compose -f "$ROOT_DIR/docker-compose.dev.yml" up -d postgres

echo "Installing dependencies (monorepo) ..."
pnpm install

echo "Pushing DB schema and applying migrations..."
pnpm db:push || echo "db:push failed. If you don't have a local DB, ensure POSTGRES_URL is correct in .env.local"

echo "Validating credentials (if present)"
pnpm test:credentials || echo "test:credentials failed; please review .env.local values"

echo "Done. To run the app locally, run: pnpm --filter @repo/web dev or pnpm dev to start the monorepo dev servers"

exit 0
