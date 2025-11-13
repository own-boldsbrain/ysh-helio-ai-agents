#!/bin/bash

# Build Specialized Docker Images with Layer Caching
# This script builds optimized Docker images for different language stacks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGES_DIR="$SCRIPT_DIR/../lib/sandbox/images"
CACHE_DIR="${DOCKER_BUILDKIT_CACHE_DIR:-$HOME/.docker-buildx-cache}"

# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Function to print colored messages
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to build an image with caching
build_image() {
    local dockerfile=$1
    local image_name=$2
    local cache_from=$3
    
    log_info "Building image: $image_name"
    
    # Build with BuildKit cache mount
    if docker build \
        --file "$dockerfile" \
        --tag "$image_name" \
        --cache-from "$cache_from" \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --progress=plain \
        "$SCRIPT_DIR/.."; then
        log_success "Successfully built $image_name"
        return 0
    else
        log_error "Failed to build $image_name"
        return 1
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to create cache directory
setup_cache() {
    if [ ! -d "$CACHE_DIR" ]; then
        log_info "Creating cache directory: $CACHE_DIR"
        mkdir -p "$CACHE_DIR"
    fi
}

# Main build function
main() {
    echo "========================================="
    echo "Building Specialized Sandbox Images"
    echo "========================================="
    echo ""
    
    check_docker
    setup_cache
    
    local build_all=false
    local build_base=false
    local build_python=false
    local build_java=false
    local build_nodejs=false
    
    # Parse arguments
    if [ $# -eq 0 ]; then
        build_all=true
    else
        for arg in "$@"; do
            case $arg in
                --all)
                    build_all=true
                    ;;
                --base)
                    build_base=true
                    ;;
                --python)
                    build_python=true
                    ;;
                --java)
                    build_java=true
                    ;;
                --nodejs)
                    build_nodejs=true
                    ;;
                --help)
                    echo "Usage: $0 [OPTIONS]"
                    echo ""
                    echo "Options:"
                    echo "  --all       Build all images (default)"
                    echo "  --base      Build base image only"
                    echo "  --python    Build Python image only"
                    echo "  --java      Build Java image only"
                    echo "  --nodejs    Build Node.js image only"
                    echo "  --help      Show this help message"
                    echo ""
                    echo "Environment Variables:"
                    echo "  DOCKER_BUILDKIT_CACHE_DIR  Cache directory (default: ~/.docker-buildx-cache)"
                    exit 0
                    ;;
                *)
                    log_error "Unknown option: $arg"
                    echo "Use --help for usage information"
                    exit 1
                    ;;
            esac
        done
    fi
    
    local failed_builds=()
    
    # Build base image
    if [ "$build_all" = true ] || [ "$build_base" = true ]; then
        if ! build_image \
            "$SCRIPT_DIR/../lib/sandbox/Dockerfile.sandbox" \
            "coding-agent-sandbox:latest" \
            "coding-agent-sandbox:latest"; then
            failed_builds+=("base")
        fi
        echo ""
    fi
    
    # Build Python image
    if [ "$build_all" = true ] || [ "$build_python" = true ]; then
        if ! build_image \
            "$IMAGES_DIR/Dockerfile.python" \
            "coding-agent-sandbox:python" \
            "coding-agent-sandbox:python"; then
            failed_builds+=("python")
        fi
        echo ""
    fi
    
    # Build Java image
    if [ "$build_all" = true ] || [ "$build_java" = true ]; then
        if ! build_image \
            "$IMAGES_DIR/Dockerfile.java" \
            "coding-agent-sandbox:java" \
            "coding-agent-sandbox:java"; then
            failed_builds+=("java")
        fi
        echo ""
    fi
    
    # Build Node.js image
    if [ "$build_all" = true ] || [ "$build_nodejs" = true ]; then
        if ! build_image \
            "$IMAGES_DIR/Dockerfile.nodejs" \
            "coding-agent-sandbox:nodejs" \
            "coding-agent-sandbox:nodejs"; then
            failed_builds+=("nodejs")
        fi
        echo ""
    fi
    
    # Summary
    echo "========================================="
    echo "Build Summary"
    echo "========================================="
    
    if [ ${#failed_builds[@]} -eq 0 ]; then
        log_success "All images built successfully!"
        echo ""
        log_info "Available images:"
        docker images | grep "coding-agent-sandbox"
        echo ""
        log_info "To use a specialized image, set in .env:"
        echo "  SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:python"
        echo "  SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:java"
        echo "  SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:nodejs"
    else
        log_error "Failed to build: ${failed_builds[*]}"
        exit 1
    fi
}

main "$@"
