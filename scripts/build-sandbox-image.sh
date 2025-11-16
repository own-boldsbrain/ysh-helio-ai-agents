#!/bin/bash
#
# Build Docker Sandbox Image
# This script builds the Docker image used for sandbox environments
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKERFILE_PATH="${PROJECT_ROOT}/lib/sandbox/Dockerfile.sandbox"
IMAGE_NAME="${SANDBOX_DOCKER_IMAGE:-coding-agent-sandbox:latest}"

echo "========================================="
echo "Building Docker Sandbox Image"
echo "========================================="
echo ""

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE_PATH" ]; then
  echo "❌ Error: Dockerfile not found at $DOCKERFILE_PATH"
  exit 1
fi

# Build the image
echo "📦 Building image: $IMAGE_NAME"
echo "📄 Using Dockerfile: $DOCKERFILE_PATH"
echo ""

cd "$PROJECT_ROOT"
docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Docker image built successfully!"
  echo "   Image: $IMAGE_NAME"
  echo ""
  echo "To verify the image, run:"
  echo "   docker images | grep coding-agent-sandbox"
  echo ""
  echo "To test the container, run:"
  echo "   docker run --rm -it $IMAGE_NAME /bin/bash"
else
  echo ""
  echo "❌ Failed to build Docker image"
  exit 1
fi
