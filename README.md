# 🤖 Coding Agent Template

**Multi-Agent AI System for Code Development with Docker Orchestration**

A comprehensive template for building multi-agent AI systems optimized for code development, featuring Docker orchestration, load balancing, and comprehensive monitoring.

## 🚀 Features

- **19 Concurrent AI Agents**: Claude, GPT-4, Gemini, Groq, and Ollama (local) agents
- **Local AI with Ollama**: Qwen2.5 Coder, Qwen2-VL (vision), Gemma2 models
- **Zero-Cost Processing**: Run code generation locally without API costs
- **Load Balancing**: Nginx with least-connection algorithm
- **Message Queue**: RabbitMQ for inter-agent communication
- **Caching Layer**: Redis for performance optimization
- **Monitoring**: Prometheus + Grafana dashboards
- **Optimized for**: 32 CPUs, 31GB RAM
- **Docker Orchestration**: Full containerized deployment
- **Monorepo Architecture**: Next.js 16, React 19, TypeScript

## 🏗️ Architecture

The system is built as a monorepo Turbo-based application with:

- **apps/web**: Main Next.js application
- **apps/playground-vite**: Vite development playground
- **apps/lab-ladle**: Component library
- **packages/lib**: Shared utilities
- **packages/ui**: Shared UI components

## 📋 Prerequisites

### System Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- **CPU**: 32 cores (minimum 16)
- **RAM**: 31GB (minimum 16GB)
- **Disk**: 100GB free space

### API Credentials

Required API keys:

- [Anthropic (Claude)](https://console.anthropic.com/)
- [OpenAI (GPT-4)](https://platform.openai.com/)
- [Google AI (Gemini)](https://makersuite.google.com/)
- [Groq](https://console.groq.com/)
- [GitHub](https://github.com/settings/tokens)
- [Vercel](https://vercel.com/account/tokens)

**Note**: Ollama runs locally and requires no API keys! 🎉

## 📦 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/own-boldsbrain/ysh-helio-ai-agents.git
cd ysh-helio-ai-agents
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

Required variables:

```bash
# AI Providers
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_AI_API_KEY=xxx
GROQ_API_KEY=gsk_xxx

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/agents

# GitHub Integration
GITHUB_TOKEN=ghp_xxx

# Vercel Sandbox
SANDBOX_VERCEL_TOKEN=xxx
```

### 3. Start Infrastructure

```bash
# Start core services + Ollama
docker-compose -f docker-compose.multi-agent.yml up -d postgres redis rabbitmq ollama

# Wait for services (30s)
sleep 30

# Verify health
docker-compose -f docker-compose.multi-agent.yml ps
```

### 4. Start Agent Pool

```bash
# Start all AI agents
docker-compose -f docker-compose.multi-agent.yml up -d
```

### 5. Verify System

```bash
# Check all services
docker-compose -f docker-compose.multi-agent.yml ps

# Test load balancer
curl http://localhost/health

# Access Grafana
open http://localhost:3001
# Default credentials: admin/admin
```

## 📊 Monitoring

### Grafana Dashboards

**Multi-Agent Performance Dashboard**

- URL: `http://localhost:3001/d/multi-agent-perf`
- Metrics:
  - Agent request rates
  - CPU availability
  - Response times (p95)
  - Task queue depth
  - Requests per provider

### Prometheus Metrics

Access: `http://localhost:9090`

Key queries:

```promql
# Agent request rate
rate(agent_requests_total[5m])

# Response time (95th percentile)
histogram_quantile(0.95, rate(agent_response_time_bucket[5m]))

# Active agents
sum(up{service="ai-agent"} == 1)
```

## 🔧 Configuration

### Agent Resources

Each agent is configured with:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '1'
      memory: 2G
```

### Running the Development Server

To run the development server locally (after setting up the backend services):

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start the development server
pnpm --filter @repo/web dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 💰 Cost Optimization

### API Pricing (per 1M tokens)

| Provider           | Input  | Output | Best For              |
| ------------------ | ------ | ------ | --------------------- |
| **Ollama (Local)** | **$0** | **$0** | **High-volume tasks** |
| Claude             | $15    | $75    | Complex reasoning     |
| GPT-4 Turbo        | $10    | $30    | General tasks         |
| Gemini Pro         | $0.50  | $1.50  | Simple tasks          |
| Groq               | $0.27  | $0.27  | Real-time responses   |

## 📚 Documentation

Complete documentation is available in the [Documentation Index](DOCS_INDEX.md) and includes:

- [Quick Start Guide](QUICK_START.md) - 5-minute setup
- [API Credentials Setup](docs/API_CREDENTIALS_SETUP.md) - Configuration guide
- [Multi-Agent Docker Setup](docs/MULTI_AGENT_DOCKER.md) - Infrastructure guide
- [Ollama Integration Guide](docs/OLLAMA_INTEGRATION.md) - Local AI setup
- [Docker Sandbox Configuration](docs/DOCKER_SANDBOX.md) - Isolated development
- [Performance Tuning](docs/PERFORMANCE.md) - Optimization guide
- [Project Roadmap](ROADMAP.md) - Planned features and issues

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🌟 Acknowledgments

- Anthropic Claude
- OpenAI GPT-4
- Google Gemini
- Groq
- Docker
- Prometheus
- Grafana
- Next.js
- TypeScript

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/own-boldsbrain/ysh-helio-ai-agents/discussions)
- **Documentation**: [Documentation Index](DOCS_INDEX.md)

---

Built with ❤️ for high-performance multi-agent AI processing
