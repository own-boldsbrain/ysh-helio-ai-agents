#!/bin/bash

# Initialize GitHub Repository for YSH Helio AI Agents
# This script sets up the local git repository and pushes to GitHub

set -e

echo "🚀 Initializing GitHub Repository for YSH Helio AI Agents"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Repository details
REPO_OWNER="own-boldsbrain"
REPO_NAME="ysh-helio-ai-agents"
REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"

echo -e "${YELLOW}Repository URL:${NC} ${REPO_URL}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
fi

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}Warning: GITHUB_TOKEN not set. You may need to authenticate manually.${NC}"
    echo "Set it with: export GITHUB_TOKEN=your_token_here"
    echo ""
fi

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository already initialized${NC}"
fi

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
    echo "⚙️  Configuring git user..."
    read -p "Enter your name: " git_name
    git config user.name "$git_name"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your email: " git_email
    git config user.email "$git_email"
fi

echo -e "${GREEN}✓ Git user configured${NC}"
echo ""

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov

# Production
build/
dist/
.next/
out/

# Environment
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Docker
docker-compose.override.yml
*.pid

# Database
*.db
*.db-shm
*.db-wal
pg_log/
dump.rdb

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
*.tmp

# Backups
*.bak
*.backup
backup-*.sql

# Sensitive
secrets/
credentials/
*.pem
*.key
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
fi

# Create initial commit if no commits exist
if [ -z "$(git log 2>/dev/null)" ]; then
    echo "📋 Creating initial commit..."
    
    # Add multi-agent files
    git add docker-compose.multi-agent.yml
    git add config/
    git add docs/MULTI_AGENT_DOCKER.md
    git add MULTI_AGENT_README.md
    git add .gitignore
    
    # Add existing documentation
    git add docs/API_CREDENTIALS_SETUP.md
    git add SETUP_COMPLETE.md
    
    # Add scripts
    git add scripts/validate-api-credentials.ts
    
    # Commit
    git commit -m "Initial commit: Multi-agent AI system

- Docker Compose configuration for 11 AI agents
- Nginx load balancer with least-connection algorithm
- PostgreSQL, Redis, RabbitMQ infrastructure
- Prometheus + Grafana monitoring stack
- Comprehensive documentation
- API credentials validation script
- Optimized for 32 CPUs and 31GB RAM"
    
    echo -e "${GREEN}✓ Initial commit created${NC}"
else
    echo -e "${GREEN}✓ Commits already exist${NC}"
fi

echo ""

# Add remote if not exists
if ! git remote | grep -q origin; then
    echo "🔗 Adding remote origin..."
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✓ Remote origin added${NC}"
else
    echo -e "${GREEN}✓ Remote origin already exists${NC}"
    
    # Update remote URL if different
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$REPO_URL" ]; then
        echo "🔄 Updating remote URL..."
        git remote set-url origin "$REPO_URL"
        echo -e "${GREEN}✓ Remote URL updated${NC}"
    fi
fi

echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
echo ""

if [ -n "$GITHUB_TOKEN" ]; then
    # Use token authentication
    REPO_URL_WITH_TOKEN="https://${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git"
    git push -u "$REPO_URL_WITH_TOKEN" main 2>&1 || {
        echo ""
        echo -e "${YELLOW}Note: If this is the first push, the main branch might not exist yet.${NC}"
        echo "Creating main branch..."
        git branch -M main
        git push -u "$REPO_URL_WITH_TOKEN" main
    }
else
    # Use SSH or prompt for credentials
    git push -u origin main 2>&1 || {
        echo ""
        echo -e "${YELLOW}Note: If this is the first push, the main branch might not exist yet.${NC}"
        echo "Creating main branch..."
        git branch -M main
        git push -u origin main
    }
fi

echo ""
echo -e "${GREEN}✅ Repository successfully pushed to GitHub!${NC}"
echo ""
echo "🌐 Repository URL: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo ""
echo "Next steps:"
echo "1. Visit the repository on GitHub"
echo "2. Add repository description and topics"
echo "3. Enable GitHub Actions (if needed)"
echo "4. Set up branch protection rules"
echo "5. Invite collaborators"
echo ""
echo -e "${GREEN}Done!${NC}"
