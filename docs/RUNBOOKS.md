# Runbooks - Operational Procedures

## Overview

This document contains runbooks for common operational procedures for the Coding Agent Template application. Each runbook provides step-by-step instructions for routine operations, incident response, and maintenance tasks.

## Incident Response Runbooks

### 1. Service Down - Critical

**Trigger:** Health check failing or monitoring alert

**Priority:** Critical

**Owner:** DevOps/SRE team

**Steps:**

1. **Immediate Assessment (5 minutes)**
   - Check application health: `curl -I http://localhost:3000/api/health`
   - Check system resources: `docker stats`
   - Review application logs: `docker logs coding-agent-web --tail 50`

2. **Service Restart (10 minutes)**
   ```bash
   # Restart the web service
   docker-compose -f docker-compose.prod.yml restart web
   
   # Wait 30 seconds before proceeding
   sleep 30
   ```

3. **Verification (5 minutes)**
   - Re-check health: `curl -I http://localhost:3000/api/health`
   - Verify metrics are flowing: `curl http://localhost:3000/api/metrics`
   - Confirm service is responding normally

4. **If Issue Persists (Additional 15 minutes)**
   - Check database connectivity: `docker logs coding-agent-postgres --tail 20`
   - Review full application logs: `docker logs coding-agent-web`
   - Check system resources and disk space
   - Consider rolling back to previous version if recently deployed

5. **Communication**
   - Update incident status in tracking system
   - Notify stakeholders of service status
   - Document root cause and resolution for post-incident review

**Rollback Steps:**
```bash
# If using Docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 2. High Error Rate Alert

**Trigger:** Error rate exceeding 5% of requests

**Priority:** High

**Owner:** Engineering team

**Steps:**

1. **Identify Error Pattern (10 minutes)**
   - Review application logs for error types
   - Check Grafana dashboard for error trends
   - Identify specific endpoints or user actions with errors

2. **Check Common Issues (10 minutes)**
   - Database connection pool exhaustion
   - External API rate limits (GitHub, AI providers)
   - Resource exhaustion (memory, CPU)

3. **Mitigation (15 minutes)**
   - If database connection issue: Scale up database or increase pool size
   - If external API: Implement retry logic or circuit breaker
   - If resource issue: Scale application or optimize code

4. **Verification**
   - Monitor error rate in Grafana
   - Check that error rate returns to normal levels
   - Verify service functionality is restored

### 3. Database Unavailable

**Trigger:** Database connection errors in application logs

**Priority:** Critical

**Owner:** DevOps/SRE team

**Steps:**

1. **Verify Database Status (5 minutes)**
   ```bash
   # Check if database container is running
   docker-compose -f docker-compose.prod.yml ps postgres
   
   # Check database logs
   docker logs coding-agent-postgres --tail 50
   ```

2. **Test Connectivity (5 minutes)**
   ```bash
   # Connect directly to database
   docker exec -it coding-agent-postgres pg_isready
   ```

3. **Basic Remediation (10 minutes)**
   ```bash
   # Restart database service
   docker-compose -f docker-compose.prod.yml restart postgres
   
   # Wait for full startup (2-3 minutes)
   sleep 180
   ```

4. **Advanced Remediation (30 minutes if needed)**
   - Check disk space: `df -h`
   - Check for table locks: `docker exec -it coding-agent-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"`
   - Restart application to reconnect: `docker-compose -f docker-compose.prod.yml restart web`

5. **Verification**
   - Confirm application can connect to database
   - Run a simple query to verify database functionality
   - Monitor for any data inconsistencies

## Routine Maintenance Runbooks

### 1. Daily Maintenance Check

**Frequency:** Daily
**Owner:** DevOps team

**Steps:**

1. **Health Check (2 minutes)**
   - Verify all services are running: `docker-compose -f docker-compose.prod.yml ps`
   - Check health endpoint: `curl -f http://localhost:3000/api/health`

2. **Log Review (5 minutes)**
   - Check for critical errors in last 24 hours
   - Review access logs for anomalies
   - Verify log rotation is working

3. **Metrics Review (5 minutes)**
   - Check Grafana dashboards for any anomalies
   - Verify metrics are being collected properly
   - Review resource utilization trends

4. **Backup Status (2 minutes)**
   - Verify database backup completed successfully (if configured)
   - Check backup storage space
   - Review backup logs for errors

5. **Documentation**
   - Record any issues or anomalies found
   - Update operational status

### 2. Weekly Maintenance

**Frequency:** Weekly
**Owner:** Engineering team

**Steps:**

1. **Performance Review (30 minutes)**
   - Analyze performance metrics from the week
   - Identify slow endpoints or queries
   - Review resource utilization patterns

2. **Security Review (15 minutes)**
   - Check for any security-related logs
   - Verify that security headers are working
   - Review access logs for suspicious activity

3. **Dependency Updates (30 minutes)**
   - Check for security advisories
   - Plan dependency updates as needed
   - Schedule updates during maintenance window

4. **Documentation Update (10 minutes)**
   - Update operational procedures if needed
   - Record weekly operational metrics
   - Update runbook effectiveness metrics

### 3. Monthly Maintenance

**Frequency:** Monthly
**Owner:** Engineering team

**Steps:**

1. **Capacity Planning (45 minutes)**
   - Review usage trends and growth projections
   - Plan for infrastructure scaling
   - Review resource utilization

2. **Security Audit (60 minutes)**
   - Review and update secrets
   - Verify security configurations
   - Check for compliance requirements

3. **Performance Tuning (60 minutes)**
   - Optimize database queries based on slow query logs
   - Adjust connection pool sizes as needed
   - Review and optimize application configurations

4. **Documentation Review (30 minutes)**
   - Update runbooks based on operational experience
   - Verify accuracy of troubleshooting guides
   - Review and update disaster recovery procedures

## Deployment Runbooks

### 1. Standard Deployment

**Pre-requisites:**
- Staging environment successfully tested
- All automated tests passing
- Rollback plan prepared

**Steps:**

1. **Pre-deployment Checks (5 minutes)**
   ```bash
   # Verify current system status
   curl -f http://localhost:3000/api/health
   
   # Backup current configuration
   docker-compose -f docker-compose.prod.yml config > backup-config-$(date +%Y%m%d).yml
   ```

2. **Deploy New Version (10 minutes)**
   ```bash
   # Build new image (if needed)
   docker build -f Dockerfile.prod -t coding-agent:latest .
   
   # Deploy with zero-downtime
   docker-compose -f docker-compose.prod.yml up -d --no-deps --build web
   ```

3. **Post-deployment Verification (10 minutes)**
   - Verify health endpoint returns success
   - Test critical functionality manually
   - Check metrics and logs for anomalies
   - Confirm traffic is flowing normally

4. **Monitoring Period (30 minutes)**
   - Monitor for errors in first 30 minutes
   - Verify metrics are reporting normally
   - Check that all instances are healthy

### 2. Rollback Procedure

**Trigger:** Critical issues after deployment

**Steps:**

1. **Immediate Action (5 minutes)**
   - Stop deployment traffic if possible
   - Identify last known good version
   - Prepare rollback command

2. **Execute Rollback (10 minutes)**
   ```bash
   # If using Docker images with tags
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verification (10 minutes)**
   - Verify health check returns to normal
   - Confirm previous functionality is restored
   - Monitor for any issues with rollback

4. **Communication**
   - Notify stakeholders of rollback
   - Document reasons for rollback
   - Plan for corrected deployment

## Database Runbooks

### 1. Database Backup

**Frequency:** Daily
**Owner:** DevOps team

**Steps:**

1. **Manual Backup (15 minutes)**
   ```bash
   # Create backup
   docker exec coding-agent-postgres pg_dump -U postgres coding_agent > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Verify backup integrity
   head -20 backup_*.sql  # Check that backup started properly
   ```

2. **Automated Backup Verification**
   - Ensure cron job or scheduled task is running
   - Verify backup files are created daily
   - Check backup file sizes for anomalies

### 2. Database Restoration

**Steps:**

1. **Prepare Environment (10 minutes)**
   - Stop application to prevent data changes
   - Backup current state if possible
   - Identify correct backup file

2. **Perform Restoration (30 minutes)**
   ```bash
   # Restore from backup
   docker exec -i coding-agent-postgres psql -U postgres -d coding_agent < backup_file.sql
   ```

3. **Verification (15 minutes)**
   - Verify data integrity
   - Check for missing or corrupt data
   - Restart application services
   - Run verification queries

## Monitoring Runbooks

### 1. Alert Triage Process

**When:** Receiving monitoring alerts

**Steps:**

1. **Alert Acknowledgment (2 minutes)**
   - Acknowledge alert in monitoring system
   - Determine alert priority (critical, warning, info)
   - Assign appropriate response team

2. **Initial Assessment (5 minutes)**
   - Review alert description and context
   - Check related metrics and logs
   - Determine if alert is false positive

3. **Response (Variable time)**
   - For critical alerts: Follow incident response runbook
   - For warning alerts: Schedule remediation
   - For false positives: Update alert thresholds

## Security Runbooks

### 1. Security Incident Response

**Steps:**

1. **Containment (Immediate)**
   - Isolate affected systems if possible
   - Preserve evidence and logs
   - Notify security team

2. **Investigation (30 minutes)**
   - Review security logs
   - Identify attack vector
   - Assess impact scope

3. **Remediation (Variable)**
   - Apply security patches
   - Block malicious IPs
   - Reset compromised credentials

4. **Recovery (Variable)**
   - Restore from clean backups if needed
   - Verify system integrity
   - Monitor for re-occurrence

## Communication Templates

### 1. Incident Status Update
```
Incident ID: INC-<number>
Status: <Investigating|Identified|Monitoring|Resolved>
Impact: <High|Medium|Low>
Last Updated: <timestamp>

Summary:
<Brief description of the issue>

Current Status:
<Current state of the issue>

Next Steps:
<Planned actions>

ETA to Resolution:
<Estimated time>
```

### 2. Maintenance Notification
```
Maintenance Window: <Start time> to <End time>
Expected Impact: <Service degradation|Outage|Performance impact>
Affected Components: <List of affected services>

Timeline:
- <time>: <action>
- <time>: <action>

Rollback Plan:
<Steps to revert the maintenance if needed>
```