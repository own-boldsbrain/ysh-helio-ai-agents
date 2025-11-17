# YSH Helio AI Agents 🤖

Multi-agent AI system optimized for high-performance parallel processing with Docker orchestration.

## 🚀 Features

- **19 Concurrent AI Agents**: Claude, GPT-4, Gemini, Groq, and Ollama (local) agents
- **Local AI with Ollama**: Qwen2.5 Coder, Qwen2-VL (vision), Gemma2 models
- **Zero-Cost Processing**: Run code generation locally without API costs
- **Load Balancing**: Nginx with least-connection algorithm
- **Message Queue**: RabbitMQ for inter-agent communication
- **Caching Layer**: Redis for performance optimization
- **Monitoring**: Prometheus + Grafana dashboards
- **Optimized for**: 32 CPUs, 31GB RAM

## 📋 System Architecture

```tsx
┌─────────────────────────────────────────────────────────────┐
│                        Nginx Load Balancer                    │
│                     (Least Connections)                       │
└────────────────────────┬───────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
┌─────────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│ Claude Agents  │ │GPT Agents│ │Gemini/Groq │
│ (3 instances)  │ │(2 inst.) │ │(4 inst.)   │
└────────┬───────┘ └────┬─────┘ └─────┬──────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │PostgreSQL│   │  Redis  │   │RabbitMQ │
    │15-alpine│   │7-alpine │   │3-mgmt   │
    └─────────┘   └─────────┘   └─────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
              ┌─────────▼─────────┐
              │Prometheus+Grafana │
              │   (Monitoring)    │
              └───────────────────┘
```

## 🛠️ Prerequisites

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

**Note**: Ollama will automatically download Qwen2.5 Coder, Qwen2-VL, and Gemma2 models (~20GB). This may take 10-30 minutes depending on your internet speed.

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

### RabbitMQ Management

- URL: `http://localhost:15672`
- Credentials: `guest/guest`

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

### PostgreSQL Optimization

Located in `config/postgresql.conf`:

```conf
max_connections = 200
shared_buffers = 2GB
effective_cache_size = 16GB
max_worker_processes = 16
```

### Redis Configuration

```yaml
command: >
  redis-server
  --maxmemory 4gb
  --maxmemory-policy allkeys-lru
```

## 📈 Scaling

### Scale Up Agents

```bash
# Add more Claude agents
docker-compose -f docker-compose.multi-agent.yml up -d --scale agent-claude-1=5

# Add more GPT agents
docker-compose -f docker-compose.multi-agent.yml up -d --scale agent-gpt-4=3
```

### Scale Down

```bash
# Reduce agent count
docker-compose -f docker-compose.multi-agent.yml up -d --scale agent-claude-1=2
```

## 🔍 Usage Examples

### Send Task to Agent Pool

```bash
curl -X POST http://localhost/api/agent/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Review this code",
    "code": "function hello() { console.log(\"Hello\"); }",
    "language": "javascript"
  }'
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.multi-agent.yml logs -f

# Specific agent
docker-compose -f docker-compose.multi-agent.yml logs -f agent-claude-1

# Last 100 lines
docker-compose -f docker-compose.multi-agent.yml logs --tail=100
```

## 🛡️ Security

### Production Checklist

- [ ] Change default passwords (PostgreSQL, RabbitMQ, Grafana)
- [ ] Enable SSL/TLS for all services
- [ ] Use Docker secrets for API keys
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Restrict network access

### Using Docker Secrets

```bash
# Create secrets
echo "sk-ant-xxx" | docker secret create anthropic_key -

# Reference in compose
secrets:
  - anthropic_key
```

## 💰 Cost Optimization

### API Pricing (per 1M tokens)

| Provider           | Input  | Output | Best For              |
| ------------------ | ------ | ------ | --------------------- |
| **Ollama (Local)** | **$0** | **$0** | **High-volume tasks** |
| Claude             | $15    | $75    | Complex reasoning     |
| GPT-4 Turbo        | $10    | $30    | General tasks         |
| Gemini Pro         | $0.50  | $1.50  | Simple tasks          |
| Groq               | $0.27  | $0.27  | Real-time responses   |

### Recommendations

1. **Use Ollama for**: Code completion, refactoring, documentation (FREE!)
2. Route simple tasks to Gemini/Groq
3. Reserve Claude for complex reasoning
4. Cache responses in Redis
5. Implement request deduplication

### Monthly Savings Example

Processing 1M tokens/day:

- **Cloud only**: ~$900-1,350/month
- **Ollama + Cloud hybrid**: ~$200-400/month
- **Savings**: ~$600-1,000/month (67-74%)

## 🐛 Troubleshooting

### Agents Not Starting

```bash
# Check logs
docker-compose -f docker-compose.multi-agent.yml logs agent-claude-1

# Common issues:
# - Missing API key in .env
# - Port conflicts
# - Insufficient memory
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Reduce agent count
docker-compose -f docker-compose.multi-agent.yml down agent-claude-3
```

### Slow Performance

```bash
# Check response times
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,rate(agent_response_time_bucket[5m]))

# Optimize:
# 1. Scale up Groq agents (fastest)
# 2. Increase PostgreSQL shared_buffers
# 3. Enable Redis persistence
```

## 📚 Documentation

- [Multi-Agent Docker Setup](docs/MULTI_AGENT_DOCKER.md)
- [Ollama Integration Guide](docs/OLLAMA_INTEGRATION.md) ⭐ NEW
- [API Credentials Setup](docs/API_CREDENTIALS_SETUP.md)
- [Performance Tuning](docs/PERFORMANCE.md)
- [Docker Sandbox](docs/DOCKER_SANDBOX.md)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

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

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/own-boldsbrain/ysh-helio-ai-agents/discussions)

---

Built with ❤️ for high-performance multi-agent AI processing
