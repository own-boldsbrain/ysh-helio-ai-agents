/**
 * Docker Secrets Initialization Script
 * 
 * This script initializes Docker secrets for sensitive credentials.
 * Run this before starting the multi-agent system in production.
 * 
 * Usage: ./scripts/init-secrets.sh
 */

#!/bin/bash

set -e

echo "🔐 Initializing Docker Secrets..."

# Check if running in swarm mode
if ! docker info | grep -q "Swarm: active"; then
  echo "⚠️  Docker Swarm is not active. Initializing swarm mode..."
  docker swarm init
fi

# Function to create secret from env variable
create_secret() {
  local secret_name=$1
  local env_var=$2
  
  if [ -z "${!env_var}" ]; then
    echo "⚠️  Warning: ${env_var} not set, skipping ${secret_name}"
    return
  fi
  
  # Remove existing secret if it exists
  docker secret rm ${secret_name} 2>/dev/null || true
  
  # Create new secret
  echo "${!env_var}" | docker secret create ${secret_name} -
  echo "✅ Created secret: ${secret_name}"
}

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo "❌ Error: .env.local file not found"
  exit 1
fi

# Create secrets for API keys
echo ""
echo "Creating API key secrets..."
create_secret anthropic_api_key ANTHROPIC_API_KEY
create_secret openai_api_key OPENAI_API_KEY
create_secret gemini_api_key GEMINI_API_KEY
create_secret groq_api_key GROQ_API_KEY
create_secret nvidia_api_key NVIDIA_API_KEY
create_secret openrouter_api_key OPENROUTER_API_KEY
create_secret hf_token HUGGINGFACE_API_KEY

# Create secrets for database credentials
echo ""
echo "Creating database secrets..."
create_secret postgres_password POSTGRES_PASSWORD
create_secret postgres_url POSTGRES_URL

# Create secrets for authentication
echo ""
echo "Creating authentication secrets..."
create_secret nextauth_secret NEXTAUTH_SECRET
create_secret jwe_secret JWE_SECRET
create_secret encryption_key ENCRYPTION_KEY
create_secret github_client_secret GITHUB_CLIENT_SECRET

# Create secrets for Docker Hub
echo ""
echo "Creating Docker Hub secrets..."
create_secret docker_username DOCKER_USERNAME
create_secret docker_password DOCKER_PASSWORD

# Create secrets for RabbitMQ
echo ""
echo "Creating RabbitMQ secrets..."
create_secret rabbitmq_user RABBITMQ_USER
create_secret rabbitmq_pass RABBITMQ_PASS

# Create secrets for AWS
echo ""
echo "Creating AWS secrets..."
create_secret aws_access_key_id AWS_ACCESS_KEY_ID
create_secret aws_secret_access_key AWS_SECRET_ACCESS_KEY

# List all secrets
echo ""
echo "📋 Created secrets:"
docker secret ls

echo ""
echo "✅ Secrets initialization complete!"
echo ""
echo "⚠️  Important:"
echo "  1. Never commit .env.local to version control"
echo "  2. Rotate secrets regularly (recommended: every 90 days)"
echo "  3. Use 'docker secret ls' to list secrets"
echo "  4. Use 'docker secret rm <name>' to remove secrets"
echo ""
echo "🚀 You can now start the multi-agent system with secrets:"
echo "   docker stack deploy -c docker-compose.multi-agent.yml coding-agent"
