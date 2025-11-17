# 🏗️ ARCHITECTURE & TROUBLESHOOTING GUIDE

**Version**: 2.0.0  
**Last Updated**: November 17, 2025  
**Purpose**: Complete reference for understanding and debugging the multi-agent system

---

## 📐 SYSTEM ARCHITECTURE

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│              (React 19 + Tailwind CSS)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              API Layer (app/api/routes)                      │
│  ├─ Authentication (GitHub OAuth)                           │
│  ├─ Repository Operations (GitHub)                          │
│  ├─ Sandbox Management (Docker)                             │
│  ├─ Task Queue (RabbitMQ)                                   │
│  └─ Agent Routing (Arctic Framework)                        │
└────────┬────────────────────────────────┬────────┬──────────┘
         │                                │        │
         ↓                                ↓        ↓
    ┌─────────────┐            ┌──────────────────────┐
    │  GitHub API │            │  Docker Daemon       │
    │             │            │  (Sandbox Creation)  │
    └─────────────┘            └──────────────────────┘
                                        │
                                        ↓
                              ┌──────────────────────┐
                              │   Docker Containers  │
                              │  ├─ Node Sandbox     │
                              │  ├─ Python Sandbox   │
                              │  └─ Java Sandbox     │
                              └──────────────────────┘
         │                                │
         ↓                                ↓
    ┌─────────────┐            ┌──────────────────────┐
    │  PostgreSQL │            │  Redis Cache         │
    │  (State)    │            │  (Performance)       │
    └─────────────┘            └──────────────────────┘
         │
         ↓
    ┌─────────────┐
    │  RabbitMQ   │
    │  (Messages) │
    └─────────────┘
```

### Component Architecture

```
coding-agent-template/
│
├── apps/
│   ├── web/                    # Main Next.js application (PORT 3000)
│   │   ├── app/
│   │   │   ├── api/            # API routes
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   ├── repos/          # Repository pages
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # React components
│   │   └── lib/                # Client utilities
│   │
│   ├── playground-vite/        # Vite sandbox (PORT 5173)
│   └── lab-ladle/              # Component library
│
├── packages/
│   ├── lib/
│   │   ├── sandbox/            # Core sandbox implementation
│   │   │   ├── docker-sandbox.ts
│   │   │   ├── creation.ts
│   │   │   ├── commands.ts
│   │   │   ├── types.ts
│   │   │   └── images/
│   │   │       ├── Dockerfile.nodejs
│   │   │       ├── Dockerfile.python
│   │   │       └── Dockerfile.java
│   │   │
│   │   ├── utils/
│   │   │   ├── task-logger.ts      # Logging
│   │   │   ├── logging.ts          # Log sanitization
│   │   │   └── id.ts               # ID generation
│   │   │
│   │   └── agents/
│   │       └── (agent implementations)
│   │
│   └── ui/                     # Shared UI components
│
├── docker-compose.yml          # Production services
├── docker-compose.dev.yml      # Development services
├── docker-compose.multi-agent.yml  # Multi-agent services
└── Dockerfile.dev              # Main application image
```

### Database Schema (Drizzle ORM)

```
PostgreSQL
├── users
│   ├── id (uuid, pk)
│   ├── email
│   ├── name
│   ├── github_id
│   └── created_at
│
├── repositories
│   ├── id (uuid, pk)
│   ├── owner
│   ├── repo
│   ├── url
│   └── user_id (fk)
│
├── tasks
│   ├── id (uuid, pk)
│   ├── user_id (fk)
│   ├── repo_id (fk)
│   ├── status (pending|running|completed|failed)
│   ├── agent_id
│   ├── logs
│   └── created_at
│
└── sandboxes
    ├── id (uuid, pk)
    ├── task_id (fk)
    ├── container_id
    ├── status (created|running|stopped)
    ├── ports
    └── created_at
```

---

## 🐳 DOCKER SANDBOX LIFECYCLE

### Sandbox Creation Flow

```
1. API Request Received
   ├─ Validate environment variables
   ├─ Authenticate GitHub token
   └─ Create authenticated repo URL

2. Docker Container Preparation
   ├─ Generate unique sandbox ID
   ├─ Create persistent volume
   ├─ Prepare port mappings
   └─ Set resource limits (2GB RAM, 2 CPU)

3. Container Start
   ├─ Pull base image (node:22-alpine)
   ├─ Mount volumes
   ├─ Set environment variables
   ├─ Start container
   └─ Wait for container ready (30s timeout)

4. Git Repository Cloning
   ├─ Run: git clone <auth-url>
   ├─ Checkout specific branch (if provided)
   ├─ Verify clone success
   └─ Handle authentication errors

5. Dependency Installation
   ├─ Detect package manager (npm/pnpm/yarn)
   ├─ Run: npm install (or pnpm install)
   ├─ Verify installation success
   └─ Cache dependencies for future use

6. Port Detection
   ├─ Detect running services (3000, 5173, 8000, etc.)
   ├─ Map to host ports
   ├─ Update domain/URL
   └─ Return connection info

7. Sandbox Ready
   ├─ Return sandbox ID + URL
   ├─ Register sandbox in registry
   └─ Set 60-minute timeout (default)
```

### Error Handling During Creation

```
Error: "Failed to clone repository"
├─ Cause 1: Invalid GitHub token
│  └─ Fix: Verify GITHUB_TOKEN in .env
├─ Cause 2: Network timeout
│  └─ Fix: Increase git timeout, check firewall
├─ Cause 3: Repository not found
│  └─ Fix: Verify repo owner/name
└─ Cause 4: Git credentials not configured
   └─ Fix: Use SSH keys or token auth

Error: "Container creation failed"
├─ Cause 1: Docker daemon not running
│  └─ Fix: systemctl start docker
├─ Cause 2: Insufficient disk space
│  └─ Fix: df -h /var/lib/docker
├─ Cause 3: Volume creation failed
│  └─ Fix: Check docker volume ls
└─ Cause 4: Port already in use
   └─ Fix: Free port or use dynamic allocation

Error: "Dependencies installation failed"
├─ Cause 1: npm/pnpm not found
│  └─ Fix: Update base image
├─ Cause 2: Network issues during install
│  └─ Fix: Check DNS, increase timeout
├─ Cause 3: Disk space exhausted
│  └─ Fix: Increase volume size
└─ Cause 4: Package registry error
   └─ Fix: Configure alternate registry
```

---

## 🚀 SERVICE STARTUP SEQUENCE

### Docker Compose Startup Order

```bash
# docker-compose up -d

Step 1: Start PostgreSQL
└─ Port: 5434
└─ Wait for: Listening on port 5432
└─ Health check: pg_isready

Step 2: Start Redis
└─ Port: 6379
└─ Purpose: Caching + session store
└─ Health check: PING

Step 3: Start RabbitMQ
└─ Port: 5672 (AMQP), 15672 (Management)
└─ Purpose: Message queue for agents
└─ Health check: HTTP management API

Step 4: Start Prometheus
└─ Port: 9090
└─ Purpose: Metrics collection
└─ Config: prometheus.yml

Step 5: Start Grafana
└─ Port: 3001
└─ Purpose: Visualization
└─ Datasources: Prometheus, Loki

Step 6: Start Nginx
└─ Port: 80, 443
└─ Purpose: Load balancing + reverse proxy
└─ Algorithm: least-connection

Step 7: Start Application
└─ Port: 3000
└─ Dependencies: All above services
└─ Health check: GET /health

Timeline: ~30 seconds total startup
```

### Health Check Verification

```bash
# Verify all services are healthy
docker-compose ps

# Expected output:
# postgres     Up (healthy)
# redis        Up (healthy)
# rabbitmq     Up (healthy)
# prometheus   Up (healthy)
# grafana      Up (healthy)
# nginx        Up (healthy)
# app          Up (healthy)
```

---

## 🔧 TROUBLESHOOTING GUIDE

### Issue: Sandbox Creation Hangs

**Symptoms**:
- Request never completes
- No error message
- Container created but stuck

**Diagnosis**:
```bash
# 1. Check container logs
docker logs <container-id>

# 2. Inspect container state
docker inspect <container-id>

# 3. Check network connectivity
docker exec <container-id> ping github.com

# 4. Check git clone progress
docker exec <container-id> ps aux | grep git

# 5. Check disk space in container
docker exec <container-id> df -h
```

**Solutions**:
- Increase timeout: `config.timeout = '10m'`
- Use shallow clone: `--depth 1`
- Increase network timeout: `git config http.postBuffer 524288000`
- Reduce initial repository size
- Check GitHub API rate limits

---

### Issue: Out of Memory (OOM)

**Symptoms**:
- Container crashes with OOM killer
- Logs show "Killed"
- System becomes unresponsive

**Diagnosis**:
```bash
# 1. Check memory usage
docker stats <container-id>

# 2. Check OOM events
docker inspect <container-id> | grep OOMKilled

# 3. Check host memory
free -h

# 4. Check process consuming memory
docker exec <container-id> ps aux --sort=-%mem
```

**Solutions**:
- Increase container memory limit: `SANDBOX_MEMORY_LIMIT=4g`
- Reduce concurrent sandboxes
- Clear cache: `docker system prune -a`
- Monitor memory usage in Prometheus
- Implement memory-aware scheduling

---

### Issue: Port Conflicts

**Symptoms**:
- "Port already in use" error
- Cannot start application
- Multiple services competing for ports

**Diagnosis**:
```bash
# Find process using port
lsof -i :3000
netstat -tulpn | grep 3000

# Check Docker port mappings
docker ps
docker port <container-id>

# Check docker-compose services
docker-compose ps
```

**Solutions**:
- Use dynamic port allocation
- Change port in docker-compose.yml
- Kill conflicting process: `kill -9 <pid>`
- Restart docker: `systemctl restart docker`
- Use unique port ranges for each developer

---

### Issue: Database Connection Errors

**Symptoms**:
- "Cannot connect to database" errors
- "Too many connections" errors
- Random connection timeouts

**Diagnosis**:
```bash
# Check PostgreSQL logs
docker logs <postgres-container>

# Connect to database
docker exec -it postgres psql -U postgres -d coding_agent

# Check connection count
docker exec -it postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check connection pool status
docker exec -it postgres psql -U postgres -c "SHOW max_connections;"
```

**Solutions**:
```yaml
# docker-compose.yml
postgres:
  environment:
    POSTGRES_INIT_ARGS: "-c max_connections=200"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
```

---

### Issue: Network Issues

**Symptoms**:
- GitHub API errors
- Timeout failures
- DNS resolution issues

**Diagnosis**:
```bash
# Check Docker network
docker network ls
docker network inspect <network-name>

# Test DNS resolution
docker run --rm alpine nslookup github.com

# Test connectivity
docker run --rm alpine wget -O- https://api.github.com

# Check iptables rules
iptables -L -n
```

**Solutions**:
- Configure custom DNS: `--dns 8.8.8.8`
- Increase timeouts in code
- Use VPN if behind corporate firewall
- Check firewall rules
- Verify GitHub API status: status.github.com

---

### Issue: High CPU Usage

**Symptoms**:
- System becomes slow
- High load average
- Services become unresponsive

**Diagnosis**:
```bash
# Check CPU-intensive processes
top -b -n 1 | head -20

# Check Docker container CPU
docker stats --no-stream

# Check system load
uptime

# Profile Node.js process
node --prof app.js
node --prof-process isolate-*.log > profile.txt
```

**Solutions**:
- Implement request rate limiting
- Add connection pooling
- Optimize database queries
- Reduce concurrent agents
- Implement caching layer

---

### Issue: Persistent Data Loss

**Symptoms**:
- Data disappears after container restart
- Volume not mounted
- Database not persisted

**Diagnosis**:
```bash
# Check volumes
docker volume ls
docker volume inspect <volume-name>

# Check volume mount
docker inspect <container-id> | grep Mounts

# Verify data in volume
ls -la /var/lib/docker/volumes/<volume-name>/_data/
```

**Solutions**:
```yaml
# docker-compose.yml - ensure volumes are defined
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
    driver: local
```

---

## 📊 MONITORING & OBSERVABILITY

### Key Metrics to Monitor

**System Metrics**:
```
CPU Usage: docker_container_cpu_usage_seconds_total
Memory: docker_container_memory_usage_bytes
Disk I/O: docker_container_fs_usage_bytes
Network: docker_container_network_{rx,tx}_bytes_total
```

**Application Metrics**:
```
HTTP Requests: http_requests_total
Response Time: http_request_duration_seconds
Error Rate: http_requests_total{status="5xx"}
Active Connections: app_connections_active
Task Duration: app_task_duration_seconds
Agent Utilization: app_agent_utilization
```

**Database Metrics**:
```
Query Latency: db_query_duration_seconds
Connection Pool: db_connections_active
Slow Queries: db_slow_queries_total
Cache Hit Rate: cache_hit_ratio
```

### Grafana Dashboard URLs

After deployment:
- System Overview: http://localhost:3001/d/system
- Application Health: http://localhost:3001/d/app
- Database Performance: http://localhost:3001/d/database
- Agent Metrics: http://localhost:3001/d/agents

### Log Aggregation with Loki

```
# Query patterns
{service="app"} | json | status="error"
{service="sandbox"} | logfmt | duration > 10s
{job="docker"} | json | container_name=~"sandbox-.*"
```

---

## 🔐 SECURITY HARDENING CHECKLIST

- [ ] All containers run as non-root user
- [ ] Environment variables validated at startup
- [ ] Secrets stored in .env (never committed)
- [ ] Docker daemon runs rootless mode (optional)
- [ ] Network policies restrict inter-service communication
- [ ] Regular security scanning (Snyk, Trivy)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] CSRF tokens on all state-changing endpoints
- [ ] Rate limiting enabled on all API endpoints
- [ ] HTTPS enforced in production
- [ ] API keys rotated regularly
- [ ] Audit logs for all user actions

---

## 📈 PERFORMANCE OPTIMIZATION TIPS

### Database Performance
```sql
-- Add indexes for common queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);

-- Monitor slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### Docker Performance
```dockerfile
# Multi-stage builds reduce image size
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "dist/index.js"]
```

### Node.js Performance
```javascript
// Enable clustering for multi-core utilization
const cluster = require('cluster')
const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  server.listen(3000)
}
```

---

## 🆘 GETTING HELP

### Common Commands

```bash
# View all services
docker-compose ps

# View logs for specific service
docker-compose logs -f postgres

# Execute command in container
docker exec -it postgres psql -U postgres

# Restart service
docker-compose restart postgres

# Clean up
docker-compose down -v  # Remove volumes too

# Rebuild images
docker-compose build --no-cache
```

### Support Resources

- **Documentation**: See QUICK_START.md, README.md
- **Issues**: Check PRODUCTION_COVERAGE_ISSUES.md
- **Debugging**: Use commands above
- **Logs**: Check docker-compose logs output
- **Monitoring**: Check Grafana dashboards

---

**Last Updated**: November 17, 2025  
**Version**: 2.0.0
