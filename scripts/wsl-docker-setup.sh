#!/bin/bash

# wsl-docker-setup.sh - WSL Docker Environment Setup Script
# Padroniza o ambiente de desenvolvimento WSL com Docker para este projeto

set -e  # Exit on error

echo "🐳 Starting WSL Docker Environment Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    print_error "This script must be run inside WSL"
    exit 1
fi

print_success "Running in WSL environment"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed in WSL"
    print_info "Installing Docker..."
    
    # Update package lists
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for group changes to take effect"
else
    print_success "Docker is already installed"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_warning "Docker daemon is not running"
    print_info "Starting Docker service..."
    
    # Try to start Docker service
    sudo service docker start
    
    # Wait a bit for Docker to start
    sleep 3
    
    if docker info &> /dev/null; then
        print_success "Docker service started"
    else
        print_error "Failed to start Docker service"
        print_info "If using Docker Desktop, make sure it's running and WSL integration is enabled"
        exit 1
    fi
else
    print_success "Docker daemon is running"
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "docker-compose is not available"
    exit 1
fi

print_success "docker-compose is available"

# Navigate to project directory
PROJECT_DIR="/mnt/c/Users/fjuni/rookie-dev/coding-agent-template"
cd "$PROJECT_DIR"
print_success "Changed to project directory: $PROJECT_DIR"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found"
    exit 1
fi

print_success "docker-compose.yml found"

# Stop any running containers
print_info "Stopping any running containers..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
print_success "Previous containers stopped"

# Pull images
print_info "Pulling Docker images..."
docker-compose pull 2>/dev/null || docker compose pull 2>/dev/null
print_success "Images pulled"

# Start containers
print_info "Starting Docker containers..."
docker-compose up -d 2>/dev/null || docker compose up -d 2>/dev/null
print_success "Containers started"

# Wait for PostgreSQL to be ready
print_info "Waiting for PostgreSQL to be ready..."
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
until docker-compose exec -T postgres pg_isready -U postgres &> /dev/null || docker compose exec -T postgres pg_isready -U postgres &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        print_error "PostgreSQL failed to start after $MAX_RETRIES attempts"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""
print_success "PostgreSQL is ready"

# Show running containers
print_info "Running containers:"
docker-compose ps 2>/dev/null || docker compose ps 2>/dev/null

# Check if node_modules exists and is compatible with WSL
print_info "Checking node_modules..."
if [ -d "node_modules" ]; then
    # Check if node_modules was installed from Windows (check for Windows-specific binaries)
    if [ -f "node_modules/.pnpm/lightningcss-win32-x64-msvc@*/node_modules/lightningcss-win32-x64-msvc/lightningcss.win32-x64-msvc.node" ] 2>/dev/null; then
        print_warning "node_modules appears to be installed from Windows"
        print_info "Reinstalling dependencies for WSL/Linux compatibility..."
        rm -rf node_modules .pnpm .pnpm-store
        pnpm install
        print_success "Dependencies reinstalled for WSL"
    else
        print_success "node_modules is compatible with WSL"
    fi
else
    print_warning "node_modules not found"
    print_info "Installing dependencies..."
    pnpm install
    print_success "Dependencies installed"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🎉 WSL Docker Environment Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services running:"
echo "  • PostgreSQL:          localhost:5433"
echo "  • Database:            coding_agent"
echo "  • User:                postgres"
echo "  • Password:            password"
echo ""
echo "Connection string:"
echo "  postgresql://postgres:password@localhost:5433/coding_agent"
echo ""
echo "Next steps:"
echo "  1. Run database migrations:  pnpm db:push"
echo "  2. Seed the database:        pnpm db:seeds"
echo "  3. Start dev server:         pnpm dev"
echo ""
echo "Docker commands:"
echo "  • View logs:           docker-compose logs -f"
echo "  • Stop containers:     docker-compose down"
echo "  • Restart containers:  docker-compose restart"
echo "  • View status:         docker-compose ps"
echo ""
print_success "Happy coding in WSL! 🚀"
