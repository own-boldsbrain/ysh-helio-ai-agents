# Multi-Agent AI System - Docker Compose Documentation

## Overview

This Docker Compose configuration provides a production-ready multi-agent AI system optimized for high-performance parallel processing. The system leverages 32 CPUs and 31GB RAM to run multiple AI agents concurrently with load balancing, message queuing, and comprehensive monitoring.

## Architecture

### Components

1. **PostgreSQL Database** (`postgres`)
   - Version: 15-alpine
   - Purpose: Primary data store for tasks, users, and system state
   - Resources: 4 CPUs, 8GB RAM
   - Max Connections: 200
   - Optimized for high concurrency

2. **Redis Cache** (`redis`)
   - Version: 7-alpine
   - Purpose: Caching layer and task queue
   - Resources: 2 CPUs, 4GB RAM
   - Max Memory: 4GB with LRU eviction
   - Persistence: RDB snapshots

3. **RabbitMQ Message Queue** (`rabbitmq`)
   - Version: 3-management-alpine
   - Purpose: Inter-agent communication and task distribution
   - Resources: 2 CPUs, 4GB RAM
   - Management UI: Port 15672
   - AMQP Port: 5672

4. **Nginx Load Balancer** (`nginx`)
   - Version: Alpine
   - Purpose: Distribute requests across agent pool
   - Algorithm: Least connections
   - Health checks: 3 max failures, 30s timeout

5. **AI Agent Pool** (11 containers)
   - Claude Agents (3): Premium tier, advanced reasoning
   - GPT-4 Agents (2): Premium tier, general purpose
   - Gemini Agents (2): Standard tier, fast responses
   - Groq Agents (2): Ultra-fast tier, real-time processing
   - Code Review Agent (1): Specialized for code analysis
   - Test Writer Agent (1): Specialized for test generation
   - Resources per agent: 2 CPUs, 4GB RAM

6. **Monitoring Stack**
   - Prometheus: Metrics collection and alerting
   - Grafana: Visualization and dashboards
   - Resources: 1 CPU, 2GB RAM each

### Network

- Custom bridge network: `agent-network`
- Subnet: `172.28.0.0/16`
- DNS: Automatic service discovery

## Prerequisites

### System Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- 32 CPU cores (minimum 16)
- 31GB RAM (minimum 16GB)
- 100GB disk space

### API Credentials

Required environment variables in `.env`:

```bash
# Core Services
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/agents
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# AI Providers
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_AI_API_KEY=xxx
GROQ_API_KEY=gsk_xxx

# GitHub Integration
GITHUB_TOKEN=ghp_xxx
GITHUB_OAUTH_CLIENT_ID=xxx
GITHUB_OAUTH_CLIENT_SECRET=xxx

# Vercel Sandbox
SANDBOX_VERCEL_TOKEN=xxx
SANDBOX_VERCEL_TEAM_ID=xxx
SANDBOX_VERCEL_PROJECT_ID=xxx
```

## Getting Started

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

### 2. Start Infrastructure

```bash
# Start core services (PostgreSQL, Redis, RabbitMQ)
docker-compose -f docker-compose.multi-agent.yml up -d postgres redis rabbitmq

# Wait for services to be ready (30 seconds)
sleep 30

# Check health
docker-compose -f docker-compose.multi-agent.yml ps
```

### 3. Start Agent Pool

```bash
# Start all AI agents
docker-compose -f docker-compose.multi-agent.yml up -d \
  agent-claude-1 agent-claude-2 agent-claude-3 \
  agent-gpt-4 agent-gpt-4-turbo \
  agent-gemini-pro agent-gemini-flash \
  agent-groq-llama agent-groq-mixtral \
  agent-code-review agent-test-writer

# Verify agents are running
docker-compose -f docker-compose.multi-agent.yml logs -f agent-claude-1
```

### 4. Start Load Balancer

```bash
# Start Nginx
docker-compose -f docker-compose.multi-agent.yml up -d nginx

# Test load balancer
curl http://localhost/health
```

### 5. Start Monitoring

```bash
# Start Prometheus and Grafana
docker-compose -f docker-compose.multi-agent.yml up -d prometheus grafana

# Access Grafana: http://localhost:3001
# Default credentials: admin/admin
```

## Usage

### Sending Tasks to Agents

```bash
# Via Nginx load balancer (automatically routes to available agent)
curl -X POST http://localhost/api/agent/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Review this code",
    "code": "function hello() { console.log(\"Hello\"); }",
    "language": "javascript"
  }'
```

### Monitoring

#### Grafana Dashboards

1. **Multi-Agent Performance**: http://localhost:3001/d/multi-agent-perf
   - Agent request rates
   - CPU availability
   - Response times (p95)
   - Task queue depth
   - Requests per provider

2. **Import Dashboard**:
   - Login to Grafana
   - Go to Dashboards → Import
   - Upload `config/grafana/dashboards/multi-agent-performance.json`

#### Prometheus Metrics

Access raw metrics: http://localhost:9090

Key queries:

```promql
# Agent request rate
rate(agent_requests_total[5m])

# Agent response time (p95)
histogram_quantile(0.95, rate(agent_response_time_bucket[5m]))

# Active agents
sum(up{service="ai-agent"} == 1)

# Task queue depth
rabbitmq_queue_messages{queue="agent_tasks"}
```

#### RabbitMQ Management

- URL: http://localhost:15672
- Credentials: guest/guest
- Monitor queues, exchanges, and message rates

### Scaling

#### Scale Up Agents

```bash
# Add more Claude agents
docker-compose -f docker-compose.multi-agent.yml up -d --scale agent-claude-1=5

# Add more GPT agents
docker-compose -f docker-compose.multi-agent.yml up -d --scale agent-gpt-4=3
```

#### Scale Down

```bash
# Remove excess agents
docker-compose -f docker-compose.multi-agent.yml up -d --scale agent-claude-1=2
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.multi-agent.yml logs -f

# View specific service
docker-compose -f docker-compose.multi-agent.yml logs -f agent-claude-1

# View last 100 lines
docker-compose -f docker-compose.multi-agent.yml logs --tail=100

# Follow logs with timestamps
docker-compose -f docker-compose.multi-agent.yml logs -f -t
```

## Maintenance

### Database Backups

```bash
# Backup PostgreSQL
docker exec -t postgres pg_dump -U postgres agents > backup-$(date +%Y%m%d).sql

# Restore backup
cat backup-20240101.sql | docker exec -i postgres psql -U postgres agents
```

### Redis Backups

```bash
# Trigger RDB snapshot
docker exec redis redis-cli BGSAVE

# Copy snapshot
docker cp redis:/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```

### Clean Up

```bash
# Stop all services
docker-compose -f docker-compose.multi-agent.yml down

# Remove volumes (WARNING: deletes all data)
docker-compose -f docker-compose.multi-agent.yml down -v

# Remove unused images
docker image prune -a
```

## Performance Tuning

### PostgreSQL

Edit `config/postgresql.conf` for your workload:

```conf
# For read-heavy workloads
shared_buffers = 4GB
effective_cache_size = 24GB

# For write-heavy workloads
wal_buffers = 32MB
checkpoint_completion_target = 0.9
```

### Redis

Adjust memory policy in `docker-compose.multi-agent.yml`:

```yaml
command: >
  redis-server
  --maxmemory 8gb
  --maxmemory-policy allkeys-lru
```

### Agent Resources

Modify CPU and memory limits per agent:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
```

## Troubleshooting

### Agents Not Starting

```bash
# Check logs
docker-compose -f docker-compose.multi-agent.yml logs agent-claude-1

# Common issues:
# - Missing API key: Check .env file
# - Port conflict: Change ports in docker-compose.yml
# - Memory limit: Increase agent memory limit
```

### High Memory Usage

```bash
# Check memory usage per container
docker stats

# Reduce agent count
docker-compose -f docker-compose.multi-agent.yml down agent-claude-3

# Adjust memory limits
# Edit docker-compose.multi-agent.yml and restart
```

### Slow Performance

```bash
# Check resource utilization
docker stats

# Check agent response times
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,rate(agent_response_time_bucket[5m]))

# Check database connections
docker exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Optimize:
# 1. Scale up fast agents (Groq)
# 2. Increase PostgreSQL shared_buffers
# 3. Enable Redis persistence
```

### Network Issues

```bash
# Check network connectivity
docker network inspect agent-network

# Test inter-service communication
docker exec agent-claude-1 ping postgres

# Recreate network
docker-compose -f docker-compose.multi-agent.yml down
docker network rm agent-network
docker-compose -f docker-compose.multi-agent.yml up -d
```

## Security

### Production Checklist

- [ ] Change default passwords (PostgreSQL, RabbitMQ, Grafana)
- [ ] Enable SSL/TLS for all services
- [ ] Use Docker secrets for API keys
- [ ] Restrict network access with firewall rules
- [ ] Enable authentication on Prometheus and Grafana
- [ ] Use read-only database replicas for agents
- [ ] Implement rate limiting on Nginx
- [ ] Enable audit logging on PostgreSQL

### Docker Secrets

```bash
# Create secrets
echo "sk-ant-xxx" | docker secret create anthropic_key -
echo "sk-xxx" | docker secret create openai_key -

# Reference in compose file
secrets:
  - anthropic_key
  - openai_key
```

## Cost Optimization

### API Usage

- **Claude**: $15/MTok (input), $75/MTok (output) - Use for complex reasoning
- **GPT-4 Turbo**: $10/MTok (input), $30/MTok (output) - Use for general tasks
- **Gemini Pro**: $0.50/MTok (input), $1.50/MTok (output) - Use for simple tasks
- **Groq**: $0.27/MTok (input), $0.27/MTok (output) - Use for real-time responses

### Recommendations

1. Route simple tasks to Gemini/Groq
2. Reserve Claude for complex reasoning
3. Cache frequent responses in Redis
4. Implement request deduplication
5. Monitor costs via Prometheus metrics

## Support

For issues and questions:

- GitHub Issues: https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues
- Documentation: https://github.com/own-boldsbrain/ysh-helio-ai-agents
- Email: support@example.com

## License

MIT License - See LICENSE file
