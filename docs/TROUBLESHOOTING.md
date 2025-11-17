# Troubleshooting Guide

## Overview

This guide provides solutions to common issues that may occur with the Coding Agent Template application. Each issue includes a description, possible causes, and step-by-step resolution procedures.

## Common Issues and Solutions

### Application Issues

#### 1. Application Fails to Start

**Symptoms:**

- Server won't start
- Error messages about missing environment variables
- Database connection failures

**Possible Causes:**

- Missing or incorrect environment variables
- Database not accessible
- Incorrect database credentials
- Port already in use

**Solutions:**

1. Verify all required environment variables are set:
   ```bash
   # Check if DATABASE_URL is set
   echo $DATABASE_URL
   ```
2. Verify database connectivity:
   ```bash
   # Test database connection
   psql $DATABASE_URL
   ```
3. Check if the specified port is available:
   ```bash
   lsof -i :3000
   ```
4. Review the application logs for specific error messages

#### 2. Health Check Fails

**Symptoms:**

- `/api/health` returns 503 status
- Docker health checks failing
- Application marked as unhealthy

**Possible Causes:**

- Database connection issues
- Process running out of resources
- Internal service dependencies unavailable

**Solutions:**

1. Check application logs for errors
2. Verify database connectivity
3. Check system resources (CPU, memory, disk)
4. Review the health check implementation in `apps/web/app/api/health/route.ts`

#### 3. Database Connection Errors

**Symptoms:**

- Database queries failing
- "Connection refused" errors
- Slow query performance

**Possible Causes:**

- Database server down
- Incorrect connection string
- Connection pool exhausted
- Network connectivity issues

**Solutions:**

1. Verify the database service is running:
   ```bash
   docker ps | grep postgres
   ```
2. Test the database connection directly:
   ```bash
   psql -h localhost -p 5432 -U username -d database_name
   ```
3. Check the connection string in environment variables
4. Verify connection pool configuration in `apps/web/lib/db/client.ts`
5. Monitor database logs for errors

#### 4. Authentication Fails

**Symptoms:**

- Can't log in
- Sessions not persisting
- "Unauthorized" errors on protected routes

**Possible Causes:**

- Session encryption keys mismatch
- Cookie settings incorrect
- Database session table issues
- OAuth configuration problems

**Solutions:**

1. Verify session encryption keys are properly set
2. Check cookie domain and security settings
3. Verify session storage is working (database or Redis)
4. Review OAuth client ID and secret configuration
5. Check if secure cookies work properly over HTTPS

### Performance Issues

#### 1. Slow Response Times

**Symptoms:**

- API requests taking longer than expected
- UI feels unresponsive
- High latency for operations

**Possible Causes:**

- Database queries not optimized
- Network latency issues
- Resource constraints (CPU, memory)
- Inefficient code algorithms

**Solutions:**

1. Enable query logging to identify slow queries:
   ```bash
   # In database configuration
   logger: process.env.NODE_ENV === 'development'
   ```
2. Add database indexes for frequently queried columns
3. Optimize API endpoints to reduce unnecessary data fetching
4. Implement caching for frequently accessed data
5. Monitor system resources (CPU, memory, disk I/O)

#### 2. High Memory Usage

**Symptoms:**

- Application consuming excessive memory
- Frequent garbage collection
- Out of memory errors

**Possible Causes:**

- Memory leaks in application code
- Large data sets not handled properly
- Caching consuming too much memory
- Connection pools too large

**Solutions:**

1. Monitor memory usage through metrics endpoint `/api/metrics`
2. Use Node.js memory profiling tools
3. Implement streaming for large data operations
4. Review connection pool configuration
5. Optimize data structures and remove unnecessary references

#### 3. Sandbox Creation Failures

**Symptoms:**

- Sandboxes fail to create
- Long delays in sandbox provisioning
- Sandbox operations timing out

**Possible Causes:**

- Vercel API key issues
- Rate limits exceeded
- Network connectivity problems
- Insufficient resources in Vercel account

**Solutions:**

1. Verify Vercel API token configuration
2. Check Vercel account limits and billing
3. Test Vercel API connectivity directly
4. Review sandbox creation parameters
5. Monitor Vercel dashboard for any account issues

### Security Issues

#### 1. Security Headers Missing

**Symptoms:**

- Security scanning tools report missing headers
- Security headers not applied to responses

**Possible Causes:**

- Middleware not properly configured
- Headers being overridden elsewhere
- Environment-specific configuration issues

**Solutions:**

1. Verify middleware configuration in `apps/web/middleware.ts`
2. Check that headers are applied to all relevant routes
3. Review any custom response handling that might override headers
4. Test with security header analysis tools

#### 2. SSL/TLS Configuration Issues

**Symptoms:**

- SSL certificate errors
- Mixed content warnings
- Invalid SSL configurations

**Possible Causes:**

- Incorrect certificate configuration
- HTTPS not enforced properly
- CDN or proxy SSL termination issues

**Solutions:**

1. Ensure HTTPS is enforced with proper redirects
2. Verify SSL certificate installation
3. Check Content Security Policy for mixed content issues
4. Configure proper HSTS headers

### Monitoring Issues

#### 1. Metrics Not Appearing in Prometheus

**Symptoms:**

- Metrics endpoint accessible but not showing in Prometheus
- Grafana dashboards showing no data

**Possible Causes:**

- Prometheus scraping configuration incorrect
- Network connectivity issues between services
- Metric endpoint returning errors

**Solutions:**

1. Verify Prometheus configuration at `docker/prometheus.yml`
2. Check Prometheus targets status: `http://prometheus:9090/targets`
3. Test metrics endpoint directly: `curl http://web:3000/api/metrics`
4. Verify network connectivity between containers

#### 2. Logging Issues

**Symptoms:**

- Logs not appearing in centralized logging
- Incorrect log format
- Missing log context

**Possible Causes:**

- Logging configuration issues
- Log format not compatible with aggregator
- Structured logging not properly implemented

**Solutions:**

1. Verify logger implementation in `@repo/lib/src/logger.ts`
2. Check that logs are in JSON format
3. Ensure all logs include proper context information
4. Test with Loki: `curl -G "http://loki:3100/loki/api/v1/query_range" --data-urlencode 'query'='{app="coding-agent"}'`

## Diagnostic Commands

### Application Health Checks

```bash
# Check application health
curl -I http://localhost:3000/api/health

# Check application metrics
curl http://localhost:3000/api/metrics

# Check if all services are running
docker-compose -f docker-compose.prod.yml ps
```

### Database Diagnostics

```bash
# Check database connectivity
docker exec -it coding-agent-postgres psql -U postgres -c "SELECT 1;"

# Check database size and performance
docker exec -it coding-agent-postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('coding_agent'));"

# View recent database logs
docker logs coding-agent-postgres --tail 50
```

### System Resource Diagnostics

```bash
# Check system resource usage
docker stats coding-agent-web coding-agent-postgres

# Check application logs
docker logs coding-agent-web --tail 50

# Monitor resource usage over time
docker stats --no-stream
```

### Network Diagnostics

```bash
# Check if services can reach each other
docker exec -it coding-agent-web ping coding-agent-postgres

# Check port bindings
docker port coding-agent-web

# Test internal service connectivity
docker exec -it coding-agent-web curl -I http://coding-agent-postgres:5432
```

## Debugging Strategies

### 1. Logging and Monitoring

1. Enable debug logging temporarily
2. Monitor metrics for anomalies
3. Check logs in chronological order
4. Look for patterns in errors

### 2. Isolation

1. Test with minimal configuration
2. Isolate the problematic component
3. Verify dependencies independently
4. Use development vs production settings

### 3. Reproduction

1. Create minimal reproduction case
2. Identify steps that trigger the issue
3. Test with different data inputs
4. Verify consistency of the problem

## Performance Monitoring

### Key Metrics to Watch

- Response times for API endpoints
- Database query execution times
- Memory usage over time
- Error rates
- Request throughput
- Cache hit ratios
- Network latency

### Setting Up Alerts

Create alerts for:

- High error rates (>5% of requests)
- Slow response times (>5s for API calls)
- High memory usage (>85%)
- Database connection pool exhaustion
- Failed health checks

## Recovery Procedures

### Application Recovery

1. Check application logs for the root cause
2. Restart the application services
3. Verify external dependencies
4. Monitor for issue recurrence

### Data Recovery

1. Restore from latest backup
2. Verify data integrity
3. Rebuild any inconsistent indexes
4. Test application functionality with restored data

### Database Recovery

1. Restore from database backup
2. Apply any missed transactions from WAL logs
3. Verify referential integrity
4. Update application configuration if necessary

## Support Resources

### When to Escalate

- Issues persisting after basic troubleshooting
- Security-related concerns
- Data integrity issues
- Performance problems affecting users

### Information to Provide When Seeking Help

- Detailed error messages and stack traces
- Steps to reproduce the issue
- Environment information (version, OS, etc.)
- Relevant log snippets
- Configuration settings
- Recent changes to the system
