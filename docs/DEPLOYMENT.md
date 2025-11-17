# Deployment & Operations Guide

## Prerequisites

### System Requirements
- Docker and Docker Compose
- Node.js 20+ and pnpm
- PostgreSQL 15+ (for production)
- Redis (for session management)

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/coding-agent-template.git
   cd coding-agent-template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development Setup

### Running Locally
1. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. The application will be available at `http://localhost:3000`

### Running with Docker (Development)
1. Build and start services:
   ```bash
   docker-compose up --build
   ```

## Production Deployment

### Docker Production Deployment

#### Prerequisites for Production
- Production PostgreSQL database
- Redis instance
- SSL certificate
- Domain name configured

#### Steps

1. **Prepare environment variables**:
   Create a `.env.production` file with all production values:
   ```env
   DATABASE_URL=postgresql://user:pass@db:5432/coding_agent_prod
   REDIS_URL=redis://redis:6379
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   # ... other production variables
   ```

2. **Build the production Docker image**:
   ```bash
   docker build -f Dockerfile.prod -t coding-agent:prod .
   ```

3. **Run with production compose file**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Kubernetes Deployment (Optional)

For Kubernetes deployment, use the provided template:
```bash
kubectl apply -f K8S_DEPLOYMENT.template.yaml
```

## Configuration Management

### Environment Variables

#### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `NODE_ENV` - Environment (development/production)

#### Optional Variables
- `PORT` - Port to run the application (default: 3000)
- `REDIS_URL` - Redis connection string (if using Redis)
- `API_SECRET` - Secret for API authentication
- `JWE_SECRET` - Secret for JWE encryption
- `VERCEL_PROJECT_ID` - Vercel project ID for sandbox integration
- `VERCEL_TEAM_ID` - Vercel team ID for sandbox integration

### Secrets Management
Production secrets should be managed through:
1. Kubernetes secrets
2. Docker secrets
3. Environment-specific secret stores
4. Infrastructure-as-code secret management

## Database Setup

### Initial Setup
1. Run database migrations:
   ```bash
   pnpm db:push  # For development
   # or
   pnpm db:migrate  # For production
   ```

### Connection Pooling
The application uses PostgreSQL connection pooling with the following configuration:
- Maximum connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 10 seconds

### Backup and Recovery
Regular database backups should be scheduled using:
```bash
# Daily backup example
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d).sql
```

## Service Configuration

### Web Service
- Port: 3000 (configurable)
- Health check: `/api/health`
- Metrics: `/api/metrics`
- Resource limits: 1 CPU, 1GB RAM

### Database Service
- Port: 5432
- Persistent storage: Required
- Resource limits: 2 CPU, 1GB RAM
- Connection pooling: Enabled

### Redis Service
- Port: 6379
- Persistence: Optional (for session storage)
- Resource limits: 0.5 CPU, 256MB RAM

## Monitoring and Observability

### Metrics Collection
Prometheus metrics are available at `/api/metrics` endpoint.
Configure your Prometheus server to scrape this endpoint every 15 seconds.

### Health Checks
- Liveness probe: `curl -f http://localhost:3000/api/health`
- Readiness probe: `curl -f http://localhost:3000/api/health`
- Both return HTTP 200 when healthy

### Logging
- Structured JSON logs are written to stdout/stderr
- Log rotation should be configured in production
- Logs can be forwarded to centralized logging (Loki, ELK, etc.)

## Scaling

### Horizontal Scaling
The application is designed to be horizontally scalable:
1. Multiple instances can run behind a load balancer
2. Session management works with Redis for distributed sessions
3. Database connections are pooled and managed

### Vertical Scaling
Resource limits can be adjusted in the Docker Compose or Kubernetes files:
- Increase CPU/Memory for the web service based on load
- Scale database resources based on concurrent connections
- Adjust Redis resources based on session volume

## Maintenance Procedures

### Daily Maintenance
- Monitor service health and metrics
- Check log files for errors
- Verify backup jobs completed successfully

### Weekly Maintenance
- Review performance metrics
- Check security logs
- Review application logs for anomalies
- Test backup restoration procedure

### Monthly Maintenance
- Update dependencies (following testing)
- Review security advisories
- Performance tuning based on metrics
- Database maintenance tasks (index optimization, etc.)

## Security

### Secrets Management
- Never commit secrets to the repository
- Use environment variables or secret management systems
- Rotate API keys regularly
- Use different keys for different environments

### Access Control
- Implement rate limiting to prevent abuse
- Use authentication for sensitive endpoints
- Validate and sanitize all user inputs
- Implement proper session management

## Troubleshooting

### Common Issues
See the separate troubleshooting guide for common issues and solutions.

### Support
- Check logs for error details
- Verify environment variables are set correctly
- Ensure database connectivity
- Monitor resource usage for performance issues

## Rollback Procedures

### Docker Compose Rollback
```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Start previous version
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Rollback
```bash
kubectl rollout undo deployment/coding-agent
```

## Performance Tuning

### Database
- Ensure proper indexing on frequently queried columns
- Monitor slow query logs
- Adjust connection pool settings based on usage
- Implement read replicas if needed

### Application
- Monitor memory usage and implement proper cleanup
- Use caching to reduce database load
- Optimize API calls and reduce response times
- Implement efficient algorithms for heavy operations