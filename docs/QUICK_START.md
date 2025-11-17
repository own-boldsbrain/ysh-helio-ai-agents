# Quick Start Guide - YSH Helio AI Agents

## 🚀 5-Minute Setup

Get your multi-agent AI system running in 5 minutes.

### Prerequisites Check

```bash
# Check Docker
docker --version  # Need 20.10+

# Check resources
docker info | grep -E "CPUs|Total Memory"
# Need: 16+ CPUs, 16GB+ RAM

# Check Compose
docker-compose --version  # Need 2.0+
```

### Step 1: Clone & Configure (1 min)

```bash
# Clone repository
git clone https://github.com/own-boldsbrain/ysh-helio-ai-agents.git
cd ysh-helio-ai-agents

# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Minimum required keys:**

```bash
ANTHROPIC_API_KEY=sk-ant-xxx     # Get at console.anthropic.com
OPENAI_API_KEY=sk-xxx             # Get at platform.openai.com
GOOGLE_AI_API_KEY=xxx             # Get at makersuite.google.com
GROQ_API_KEY=gsk_xxx              # Get at console.groq.com
```

### Step 2: Start Core Services (2 min)

```bash
# Start database, cache, and queue
docker-compose -f docker-compose.multi-agent.yml up -d \
  postgres redis rabbitmq

# Wait for services to be ready
echo "Waiting 30 seconds for services..."
sleep 30

# Verify services are running
docker-compose -f docker-compose.multi-agent.yml ps
```

Expected output:

```
NAME                STATUS              PORTS
postgres            Up 30 seconds       0.0.0.0:5432->5432/tcp
redis               Up 30 seconds       0.0.0.0:6379->6379/tcp
rabbitmq            Up 30 seconds       0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
```

### Step 3: Start AI Agents (1 min)

```bash
# Start all AI agents
docker-compose -f docker-compose.multi-agent.yml up -d

# Wait for agents to initialize
sleep 10

# Check agent status
docker-compose -f docker-compose.multi-agent.yml ps | grep agent
```

Expected: 11 agents running (agent-claude-1, agent-gpt-4, etc.)

### Step 4: Start Load Balancer (30 sec)

```bash
# Start Nginx
docker-compose -f docker-compose.multi-agent.yml up -d nginx

# Test load balancer health
curl http://localhost/health
```

Expected: `healthy`

### Step 5: Start Monitoring (30 sec)

```bash
# Start Prometheus and Grafana
docker-compose -f docker-compose.multi-agent.yml up -d \
  prometheus grafana

# Access Grafana
open http://localhost:3001
```

**Grafana login:**

- Username: `admin`
- Password: `admin` (will prompt to change)

---

## ✅ Verification

### All Services Running

```bash
docker-compose -f docker-compose.multi-agent.yml ps
```

Should show 16 services running:

- 1 PostgreSQL
- 1 Redis
- 1 RabbitMQ
- 11 AI Agents
- 1 Nginx
- 1 Prometheus
- 1 Grafana

### Health Checks

```bash
# Load balancer
curl http://localhost/health
# Expected: healthy

# Database
docker exec postgres pg_isready -U postgres
# Expected: accepting connections

# Redis
docker exec redis redis-cli ping
# Expected: PONG

# RabbitMQ
curl http://localhost:15672/api/healthchecks/node
# Expected: {"status":"ok"}
```

### Resource Usage

```bash
# Check container resource usage
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

Expected: Each agent using ~2 CPUs, ~2-4GB RAM

---

## 🎯 First Task

### Send a Task to Agents

```bash
curl -X POST http://localhost/api/agent/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Explain this code",
    "code": "const sum = (a, b) => a + b;",
    "language": "javascript"
  }'
```

**Response:**

```json
{
  "status": "queued",
  "taskId": "task-12345",
  "agent": "agent-claude-1",
  "estimatedTime": "5s"
}
```

### Check Task Status

```bash
curl http://localhost/api/agent/task/task-12345
```

---

## 📊 Monitoring

### Grafana Dashboard

1. Open: <http://localhost:3001>
2. Login: `admin/admin`
3. Navigate to: Dashboards → Multi-Agent Performance
4. See:
   - Request rates per agent
   - Response times (p95)
   - CPU availability
   - Task queue depth

### Prometheus Metrics

Open: <http://localhost:9090>

**Key queries:**

```promql
# Active agents
sum(up{service="ai-agent"} == 1)

# Request rate (requests/sec)
rate(agent_requests_total[5m])

# Response time 95th percentile
histogram_quantile(0.95, rate(agent_response_time_bucket[5m]))
```

### RabbitMQ Management

1. Open: <http://localhost:15672>
2. Login: `guest/guest`
3. Check:
   - Queues → agent_tasks (pending tasks)
   - Connections (agent connections)
   - Channels (active channels)

---

## 🔧 Common Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.multi-agent.yml logs -f

# Specific agent
docker-compose -f docker-compose.multi-agent.yml logs -f agent-claude-1

# Last 50 lines
docker-compose -f docker-compose.multi-agent.yml logs --tail=50
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.multi-agent.yml restart

# Restart specific service
docker-compose -f docker-compose.multi-agent.yml restart agent-gpt-4
```

### Stop System

```bash
# Stop all services (keeps data)
docker-compose -f docker-compose.multi-agent.yml stop

# Stop and remove containers (keeps data)
docker-compose -f docker-compose.multi-agent.yml down

# Stop and remove everything including data
docker-compose -f docker-compose.multi-agent.yml down -v
```

### Scale Agents

```bash
# Add more Claude agents
docker-compose -f docker-compose.multi-agent.yml up -d \
  --scale agent-claude-1=5

# Reduce agents
docker-compose -f docker-compose.multi-agent.yml up -d \
  --scale agent-claude-1=2
```

---

## 🐛 Troubleshooting

### Agent Not Starting

**Problem:** Agent container exits immediately

**Check:**

```bash
# View error logs
docker-compose -f docker-compose.multi-agent.yml logs agent-claude-1
```

**Common causes:**

1. Missing API key in `.env`
2. Invalid API key
3. Port already in use
4. Insufficient memory

**Solution:**

```bash
# Fix .env and restart
docker-compose -f docker-compose.multi-agent.yml restart agent-claude-1
```

### Database Connection Failed

**Problem:** Agents can't connect to PostgreSQL

**Check:**

```bash
# Database status
docker exec postgres pg_isready -U postgres

# Database logs
docker-compose -f docker-compose.multi-agent.yml logs postgres
```

**Solution:**

```bash
# Restart database
docker-compose -f docker-compose.multi-agent.yml restart postgres

# Wait 10 seconds
sleep 10

# Restart agents
docker-compose -f docker-compose.multi-agent.yml restart
```

### High Memory Usage

**Problem:** System using too much RAM

**Check:**

```bash
docker stats --no-stream
```

**Solution:**

```bash
# Reduce agent count
docker-compose -f docker-compose.multi-agent.yml down agent-claude-3

# Or reduce memory limits in docker-compose.multi-agent.yml:
# memory: 2G  # Instead of 4G
```

### Load Balancer Not Working

**Problem:** `curl http://localhost/health` fails

**Check:**

```bash
# Nginx status
docker-compose -f docker-compose.multi-agent.yml ps nginx

# Nginx logs
docker-compose -f docker-compose.multi-agent.yml logs nginx
```

**Solution:**

```bash
# Restart Nginx
docker-compose -f docker-compose.multi-agent.yml restart nginx
```

---

## 📚 Next Steps

### Learn More

- **Full Documentation**: [docs/MULTI_AGENT_DOCKER.md](docs/MULTI_AGENT_DOCKER.md)
- **API Setup**: [docs/API_CREDENTIALS_SETUP.md](docs/API_CREDENTIALS_SETUP.md)
- **Performance Tuning**: [docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- **Roadmap**: [ROADMAP.md](ROADMAP.md)

### Configuration

- Adjust agent resources in `docker-compose.multi-agent.yml`
- Tune database in `config/postgresql.conf`
- Configure load balancer in `config/nginx.conf`
- Add monitoring alerts in `config/prometheus.yml`

### Development

- Create custom agents
- Add new AI providers
- Implement webhooks
- Build web UI

---

## 💡 Tips

### Performance

- Use Groq agents for real-time responses (fastest)
- Use Gemini for simple tasks (cheapest)
- Reserve Claude for complex reasoning (best quality)
- Cache frequent responses in Redis

### Cost Optimization

1. Monitor API usage in Grafana
2. Route simple tasks to cheaper providers
3. Implement request deduplication
4. Set rate limits

### Scaling

- Start with 2-3 agents per provider
- Scale up based on queue depth
- Monitor CPU and memory usage
- Use auto-scaling for production

---

## ✅ Success Checklist

- [ ] All 16 services running
- [ ] Health checks passing
- [ ] Grafana dashboard accessible
- [ ] First task completed successfully
- [ ] Logs showing no errors
- [ ] Resource usage within limits

**🎉 Congratulations! Your multi-agent AI system is ready!**

---

## 📞 Need Help?

- **Documentation**: [GitHub Repository](https://github.com/own-boldsbrain/ysh-helio-ai-agents)
- **Issues**: [GitHub Issues](https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues)
- **Community**: [GitHub Discussions](https://github.com/own-boldsbrain/ysh-helio-ai-agents/discussions)

---

**Happy Multi-Agent AI Processing! 🚀**
