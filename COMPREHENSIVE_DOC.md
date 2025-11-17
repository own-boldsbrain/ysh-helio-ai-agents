# 🚀 Coding Agent Template - Complete Documentation

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Docker & Infrastructure](#-docker--infrastructure)
- [Agents & AI Integration](#-agents--ai-integration)
- [Security & Authentication](#-security--authentication)
- [Monitoring & Observability](#-monitoring--observability)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

The Coding Agent Template is a full-stack Next.js 16 application designed for AI-powered coding assistance with multi-agent support. The system orchestrates multiple AI agents (Claude, GPT-4, Gemini, Groq, and Ollama) through Docker sandboxes.

### Key Features

- **Multi-Agent AI System**: Supports Claude, GPT-4, Gemini, Groq, and Ollama agents
- **Docker Sandboxing**: Secure code execution with resource limits
- **Real-time Monitoring**: Prometheus, Grafana, Loki, Jaeger integration
- **Authentication**: GitHub OAuth support
- **Database**: PostgreSQL with Drizzle ORM
- **Type Safety**: Full TypeScript support with Zod validation

---

## 🏗️ Architecture

### Tech Stack

| Component            | Technology                             |
| -------------------- | -------------------------------------- |
| **Frontend**         | Next.js 16, React 19, TypeScript       |
| **UI Framework**     | Tailwind CSS, Radix UI, Lucide Icons   |
| **Database**         | PostgreSQL 15, Drizzle ORM             |
| **Containerization** | Docker, Docker Compose                 |
| **Monitoring**       | Prometheus, Grafana, Loki, Jaeger      |
| **Authentication**   | NextAuth.js with GitHub provider       |
| **State Management** | Jotai for global state                 |
| **Styling**          | Tailwind CSS with custom design system |

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                Next.js Frontend                 │  │
│  │            (React 19, TypeScript)              │  │
│  │    (Pages, Components, Client-Side Logic)      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js Server                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              API Routes & SSR                    │  │
│  │        (Authentication, Tasks, Agents)          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
            ┌──────────┐ ┌────────┐ ┌──────────┐
            │ PostgreSQL│ │ Redis │ │ RabbitMQ│
            │ (Drizzle) │ │(Cache) │ │(Queuing) │
            └──────────┘ └────────┘ └──────────┘
                    │         │         │
                    └─────────┼─────────┘
                              ▼
                    ┌──────────────────────┐
                    │   Docker Sandboxes   │
                    │ (Code Execution)     │
                    │ (Resource Isolation) │
                    │ (Security Controls)  │
                    └──────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
                    ▼                   ▼
            ┌─────────────────┐  ┌─────────────────┐
            │   Monitoring    │  │ Authentication  │
            │  (Prometheus,   │  │   (GitHub,     │
            │   Grafana,     │  │   Vercel)      │
            │   Loki,       │  │                │
            │   Jaeger)     │  │                │
            └─────────────────┘  └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ with pnpm
- PostgreSQL 15+ (optional, for local development)
- Git

### Quick Start

1. **Clone the repository:**

```bash
git clone https://github.com/own-boldsbrain/coding-agent-template.git
cd coding-agent-template
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment:**

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Start database:**

```bash
# For development (starts on port 5433)
docker compose -f docker-compose.dev.yml up -d

# For production (starts on port 5434)
docker compose up -d
```

5. **Run database migrations:**

```bash
# Make sure POSTGRES_URL matches your running instance
pnpm db:push
```

6. **Start development server:**

```bash
pnpm dev
```

The application will be available at http://localhost:3000

---

## 🐳 Docker & Infrastructure

### Docker Compose Files

1. **`docker-compose.yml`** - Production setup (PostgreSQL on port 5434)
2. **`docker-compose.dev.yml`** - Development setup (PostgreSQL on port 5433)
3. **`docker-compose.multi-agent.yml`** - Multi-agent setup with RabbitMQ, Redis, etc.

### Docker Sandbox Implementation

The system uses Docker for secure code execution:

```typescript
// lib/sandbox/docker-sandbox.ts
export class DockerSandbox implements SandboxType {
  async runCommand(options: { cmd: string; args: string[]; cwd?: string }): Promise<CommandResult> {
    // Executes commands in isolated Docker container
  }

  static async create(options: { ports?: number[]; volumes?: Volume[] }): Promise<DockerSandbox> {
    // Creates Docker container with resource limits
  }
}
```

### Container Configuration

- **Memory Limit**: Configurable via SANDBOX_MEMORY_LIMIT (default: 2GB)
- **CPU Limit**: Configurable via SANDBOX_CPU_LIMIT (default: 2 CPUs)
- **Volume Isolation**: Temporary volumes for file storage
- **Network Isolation**: Isolated Docker networks per sandbox

---

## 🤖 Agents & AI Integration

### Supported AI Providers

The system supports multiple AI providers with intelligent routing:

| Provider      | Models                   | Rate Limits  | Best For          |
| ------------- | ------------------------ | ------------ | ----------------- |
| **Anthropic** | Claude 3.5 Sonnet, Opus  | High         | Complex reasoning |
| **OpenAI**    | GPT-4, GPT-4 Turbo       | Moderate     | Balanced tasks    |
| **Google**    | Gemini Pro, Flash        | High         | Fast responses    |
| **Groq**      | LLaMA 3, Mixtral         | Very High    | Real-time         |
| **Ollama**    | Qwen2.5, Gemma2, LLaMA 3 | Unrestricted | Local processing  |

### Agent Types

1. **Coding Agent** - For code generation and refactoring
2. **Planner Agent** - For task decomposition and planning
3. **Reviewer Agent** - For code review and quality checks
4. **DevOps Agent** - For infrastructure and deployment tasks

### Multi-Agent Architecture

The system uses a load-balanced approach with multiple agents:

```
┌───────────────────────────────────────────────────────────┐
│                      Load Balancer                        │
│                    (Round Robin/Least                   │
│                     Connection)                         │
└─────────────────┬─────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│Agent 1  │   │Agent 2  │   │Agent 3  │   │Agent 4  │
│(Claude) │   │(GPT-4) │   │(Gemini) │   │(Groq)   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
    │             │             │             │
    └─────────────┼─────────────┼─────────────┘
                  ▼
        ┌─────────────────┐
        │   Task Queue    │
        │  (RabbitMQ)     │
        └─────────────────┘
```

---

## 🔐 Security & Authentication

### OAuth Integration

- **GitHub OAuth** - Primary authentication method
- **Session Management** - Secure session handling with NextAuth.js
- **Access Token Storage** - Encrypted storage of API tokens

### Security Features

- **Docker Sandboxing** - Isolated execution environments
- **Resource Limits** - CPU and memory constraints on sandboxes
- **API Key Protection** - Secure storage and rotation
- **Rate Limiting** - Per-user request throttling

### Secrets Management

- **Environment Variables** - For basic secrets
- **Secure Storage** - Encrypted tokens via session store
- **Token Scoping** - Minimal required scopes for operations

---

## 📊 Monitoring & Observability

### Logging Stack

- **Pino** - High-performance JSON logging
- **Loki** - Log aggregation and storage
- **Grafana** - Log visualization and dashboards

### Metrics Stack

- **Prometheus** - Metrics collection
- **cAdvisor** - Container metrics
- **Custom Metrics** - Application-level metrics using prom-client

### Distributed Tracing

- **Jaeger** - Request tracing across services
- **OpenTelemetry** - Automatic instrumentation

### Key Metrics

- Task completion times
- Agent utilization
- Memory/CPU usage
- Error rates
- Request latencies

---

## 🛠️ Development

### Project Structure

```
coding-agent-template/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── lib/                 # Shared utilities
│   ├── ui/                  # Shared UI components
│   └── tsconfig/            # Shared TypeScript configs
├── lib/
│   ├── agents/              # Agent implementations
│   ├── sandbox/             # Docker sandbox
│   └── db/                  # Database schema & migrations
├── components/              # React components
├── docs/                    # Documentation
└── scripts/                 # Development scripts
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format

# Database migrations
pnpm db:push
pnpm db:migrate
pnpm db:generate
```

### Testing Strategy

- **Unit Tests** - For utility functions and pure logic
- **Integration Tests** - For API endpoint behavior
- **End-to-End Tests** - For complete user flows
- **Performance Tests** - For load and stress testing

---

## 🚢 Deployment

### Environment Configuration

- **Production** - Use production docker-compose.yml
- **Staging** - Use staging-specific configurations
- **Development** - Use dev-specific configurations

### Deployment Steps

1. **Prepare Environment**
   - Configure environment variables
   - Set up database
   - Configure authentication providers

2. **Build Application**
   - Run `pnpm build`
   - Verify build success

3. **Start Services**
   - Start database and cache
   - Run database migrations
   - Start application servers
   - Start monitoring stack

4. **Post-Deployment**
   - Verify health endpoints
   - Check logs
   - Validate functionality

### Scaling Considerations

- **Horizontal Scaling** - Add more agent instances
- **Vertical Scaling** - Increase resource limits
- **Load Balancing** - Distribute requests across instances
- **Auto-scaling** - Scale based on queue depth

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

**Symptoms**: `ECONNREFUSED` when connecting to PostgreSQL
**Solution**:

1. Check if PostgreSQL is running: `docker ps | grep postgres`
2. Verify port in `.env` matches docker-compose: `POSTGRES_URL=...@localhost:5433/...` vs `POSTGRES_URL=...@localhost:5434/...`
3. Confirm correct docker-compose file is running

#### Docker Sandbox Failures

**Symptoms**: Commands fail to execute in sandbox
**Solution**:

1. Check Docker daemon status: `docker ps`
2. Verify container permissions: `docker run hello-world`
3. Check resource limits: `docker stats`
4. Ensure sufficient system resources

#### Authentication Problems

**Symptoms**: Sign-in fails or redirects loop
**Solution**:

1. Verify GitHub OAuth credentials in `.env`
2. Check `NEXTAUTH_URL` configuration
3. Ensure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct

#### Build Failures

**Symptoms**: `pnpm build` fails with type errors
**Solution**:

1. Run `pnpm type-check` to identify errors
2. Verify all dependencies are installed
3. Check `tsconfig.json` configurations

### Diagnostic Commands

```bash
# Check running containers
docker ps

# View application logs
docker logs coding-agent-template-postgres-1

# Check environment variables
docker exec -t coding-agent-template-postgres-1 env

# Test database connection
docker exec -t coding-agent-template-postgres-1 psql -U postgres -c "\dt"

# View next.js server logs
pnpm --filter @repo/web dev
```

---

## 📞 Support & Resources

### Documentation

- [README.md](./README.md) - Project overview and setup
- [ROADMAP.md](./docs/ROADMAP.md) - Project direction and priorities
- [API_CREDENTIALS_SETUP.md](./docs/API_CREDENTIALS_SETUP.md) - API configuration guide
- [DOCKER_SANDBOX.md](./docs/DOCKER_SANDBOX.md) - Docker sandbox configuration

### Contributing

- Follow the existing code style
- Write tests for new features
- Update documentation for API changes
- Submit pull requests with clear descriptions

### Versioning

- Use semantic versioning (major.minor.patch)
- Update CHANGELOG.md with each release
- Tag releases in git: `git tag v1.x.x`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

_Last Updated: November 17, 2025_
_Version: 2.0.0_
