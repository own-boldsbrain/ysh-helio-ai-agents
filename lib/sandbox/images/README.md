# Specialized Docker Images

This directory contains optimized Dockerfile definitions for specialized development environments.

## Available Images

### 1. Base Image (Alpine)

**File**: `../Dockerfile.sandbox`  
**Image**: `coding-agent-sandbox:latest`  
**Size**: ~762MB

Lightweight base image with:
- Node.js 20 (Alpine)
- Python 3, pip
- Git, bash, curl, openssh
- TypeScript, tsx, pnpm, yarn
- gcc, g++, make

**Best for**: General Node.js/TypeScript projects

### 2. Python Image

**File**: `Dockerfile.python`  
**Image**: `coding-agent-sandbox:python`  
**Size**: ~2.5GB

Optimized for Python development with:
- Python 3.12 (Debian Slim)
- Scientific computing: NumPy, Pandas, Matplotlib, Scikit-learn
- Web frameworks: Flask, FastAPI, Uvicorn
- Testing: Pytest, pytest-cov
- Code quality: Black, Flake8, Mypy, Pylint
- Interactive: Jupyter, IPython
- Node.js 20 (for fullstack projects)

**Best for**: Data science, ML, API development, Python web apps

### 3. Java Image

**File**: `Dockerfile.java`  
**Image**: `coding-agent-sandbox:java`  
**Size**: ~1.8GB

Optimized for Java development with:
- OpenJDK 21 (Eclipse Temurin)
- Maven 3.9.6 with pre-configured cache
- Gradle 8.5 with pre-configured cache
- Node.js 20 (for fullstack projects)
- Optimized JVM settings (UseG1GC, 2GB heap)

**Best for**: Spring Boot, enterprise Java, fullstack Java/React

### 4. Node.js Image

**File**: `Dockerfile.nodejs`  
**Image**: `coding-agent-sandbox:nodejs`  
**Size**: ~1.2GB

Optimized for modern Node.js/TypeScript development with:
- Node.js 20 (Debian Slim)
- Package managers: pnpm (with store cache), yarn, npm
- TypeScript tooling: tsx, ts-node, typescript
- Development tools: nodemon, PM2
- Framework CLIs: NestJS, Angular, Vite
- Code quality: ESLint, Prettier
- Python 3 (for build tools)

**Best for**: Next.js, React, Vue, NestJS, fullstack TypeScript

## Building Images

### Build All Images

```bash
# From project root
bash scripts/build-specialized-images.sh --all
```

### Build Specific Images

```bash
# Python only
bash scripts/build-specialized-images.sh --python

# Java only
bash scripts/build-specialized-images.sh --java

# Node.js only
bash scripts/build-specialized-images.sh --nodejs

# Base image only
bash scripts/build-specialized-images.sh --base
```

## Usage

Set the image in your `.env.local`:

```bash
# For Python projects
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:python

# For Java projects
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:java

# For Node.js projects
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:nodejs

# For general use (default)
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:latest
```

## Cache Optimization

All images use Docker BuildKit for efficient caching:

```bash
# Enable BuildKit (recommended)
export DOCKER_BUILDKIT=1

# Build with inline cache
docker build --build-arg BUILDKIT_INLINE_CACHE=1 ...

# Use cache from previous builds
docker build --cache-from coding-agent-sandbox:python ...
```

### Cache Mounts

Images use `--mount=type=cache` for package managers:

- **Python**: `/root/.cache/pip`
- **Java**: `/root/.m2` (Maven), `/root/.gradle` (Gradle)
- **Node.js**: `/root/.npm`, `/root/.pnpm-store`

This dramatically speeds up rebuilds by reusing downloaded packages.

## Customization

### Adding Packages

#### Python

Edit `Dockerfile.python` and add to the pip install command:

```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir \
    # ... existing packages ...
    your-new-package \
    another-package
```

#### Java

Add Maven dependencies in your project's `pom.xml` or Gradle dependencies in `build.gradle`. The cache volumes will persist them.

#### Node.js

Edit `Dockerfile.nodejs` and add to the npm install command:

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm install -g \
    # ... existing packages ...
    your-new-package \
    another-package
```

### Changing Base Images

- **Python**: Change `FROM python:3.12-slim` to another version
- **Java**: Change `FROM eclipse-temurin:21-jdk-jammy` to another JDK
- **Node.js**: Change `FROM node:20-slim` to another version

### Adjusting Resource Limits

Images support resource limits via environment variables:

```bash
# Set in .env.local
SANDBOX_MEMORY_LIMIT=4g
SANDBOX_CPU_LIMIT=4
```

## Comparison

| Feature | Base | Python | Java | Node.js |
|---------|------|--------|------|---------|
| Size | ~762MB | ~2.5GB | ~1.8GB | ~1.2GB |
| Node.js | ✅ | ✅ | ✅ | ✅ |
| Python | Basic | Full | Basic | Basic |
| Java | ❌ | ❌ | Full | ❌ |
| Scientific Libs | ❌ | ✅ | ❌ | ❌ |
| Build Tools | Basic | Full | Maven+Gradle | Full |
| Package Cache | ❌ | ✅ | ✅ | ✅ |
| Best For | General | Data/ML | Enterprise | Web |

## Troubleshooting

### Build Fails

**Issue**: "failed to solve with frontend dockerfile.v0"

**Solution**: Enable BuildKit:
```bash
export DOCKER_BUILDKIT=1
```

### Out of Disk Space

**Issue**: "no space left on device"

**Solution**: Clean up unused images and cache:
```bash
docker system prune -a
docker builder prune
```

### Slow Builds

**Issue**: Builds taking too long

**Solutions**:
1. Ensure BuildKit is enabled
2. Use `--cache-from` for layer reuse
3. Check Docker Desktop resources (Settings → Resources)
4. On Windows, use WSL 2 backend

### Package Installation Fails

**Issue**: Package fails to install during build

**Solutions**:
1. Check package name and version
2. Verify network connectivity during build
3. Clear Docker build cache: `docker builder prune -a`
4. Rebuild without cache: `docker build --no-cache ...`

## Performance Tips

1. **Use WSL 2** (Windows): Much faster than Hyper-V backend
2. **Increase Docker resources**: Give Docker more RAM and CPU
3. **Keep images updated**: Rebuild periodically to get security updates
4. **Use layer caching**: Don't add `--no-cache` unless necessary
5. **Prune regularly**: Run `docker system prune` weekly

## Contributing

To add a new specialized image:

1. Create `Dockerfile.{language}` in this directory
2. Add build command to `scripts/build-specialized-images.sh`
3. Update this README with image details
4. Test the build: `bash scripts/build-specialized-images.sh --{language}`

## License

These Dockerfiles are part of the coding-agent-template project and follow the same license.
