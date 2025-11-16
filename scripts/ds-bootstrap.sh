#!/bin/bash

# ds-bootstrap.sh - Development Stack Bootstrap Script
# Automates the setup and initialization of the monorepo development environment

set -e  # Exit on error

echo "🚀 Starting Development Stack Bootstrap..."
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

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

print_success "pnpm is installed"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required"
    exit 1
fi

print_success "Node.js version is compatible ($NODE_VERSION)"

# Install dependencies
print_info "Installing dependencies..."
pnpm install
print_success "Dependencies installed"

# Setup environment files
print_info "Checking environment files..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Created .env.local from .env.example"
    else
        print_warning "No .env.example found. Please create .env.local manually"
    fi
else
    print_success ".env.local exists"
fi

# Run database migrations
print_info "Checking database setup..."
if [ -n "$DATABASE_URL" ] || [ -f ".env.local" ]; then
    print_info "Running database migrations..."
    pnpm db:push || print_warning "Database migration failed or skipped"
else
    print_warning "DATABASE_URL not set, skipping database setup"
fi

# Run type checking
print_info "Running type check..."
pnpm type-check
print_success "Type check passed"

# Run linting
print_info "Running linter..."
pnpm lint
print_success "Linting passed"

# Build all apps
print_info "Building all applications..."
pnpm build
print_success "Build completed"

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🎉 Bootstrap Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Available apps:"
echo "  • Next.js Web App:     pnpm --filter @repo/web dev"
echo "  • Vite Playground:     pnpm --filter @repo/playground-vite dev"
echo "  • Ladle Stories:       pnpm --filter @repo/lab-ladle dev"
echo ""
echo "Useful commands:"
echo "  • Run all dev servers: pnpm dev"
echo "  • Run tests:           pnpm test"
echo "  • Type check:          pnpm type-check"
echo "  • Lint:                pnpm lint"
echo "  • Format:              pnpm format"
echo ""
echo "Visit:"
echo "  • Web App:             http://localhost:3000"
echo "  • Vite Playground:     http://localhost:3001"
echo "  • Ladle Stories:       http://localhost:3002"
echo ""
print_success "Happy coding! 🚀"
