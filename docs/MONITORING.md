# Monitoring & Observability Guide

## Overview

This guide describes the monitoring and observability setup for the Coding Agent Template application. The system uses Prometheus for metrics collection, Grafana for visualization, Loki for centralized logging, and Jaeger for distributed tracing.

## Architecture

### Monitoring Stack
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │    │   Monitoring     │    │   Visualization │
│   Metrics       │───►│   Services       │───►│   Tools         │
│                 │    │                  │    │                 │
│ - Health checks │    │ - Prometheus     │    │ - Grafana       │
│ - App metrics   │    │ - Loki           │    │ - AlertManager  │
│ - Performance   │    │ - Jaeger         │    │ - Custom Dash.  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Metrics Collection

### Application Metrics

#### Built-in Metrics
The application exposes the following metrics at `/api/metrics`:

- `app_requests_total` - Total number of requests (counter)
- `app_errors_total` - Total number of errors (counter)
- `app_uptime_seconds` - Application uptime in seconds (gauge)
- `app_memory_heap_bytes` - Heap memory usage in bytes (gauge)
- `app_memory_heap_max_bytes` - Maximum heap memory size in bytes (gauge)
- `app_nodejs_version_info` - Node.js version info (gauge)

#### Custom Metrics
Additional metrics can be added by extending the metrics endpoint in `apps/web/app/api/metrics/route.ts`.

### Prometheus Configuration

#### Scraping Configuration
Prometheus is configured to scrape metrics from the application every 15 seconds:

```yaml
# docker/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'coding-agent'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s
```

#### Alerting Rules
Alerting rules are defined in `docker/alert-rules.yml`:

- **ServiceDown**: Triggers when service is down for more than 1 minute
- **HighErrorRate**: Triggers when error rate exceeds 0.5 errors per second
- **HighCPUUsage**: Triggers when CPU usage is above 80%
- **HighMemoryUsage**: Triggers when memory usage is above 85%
- **DiskSpaceLow**: Triggers when disk usage is above 90%

## Logging

### Structured Logging
The application uses structured JSON logging implemented in `@repo/lib/src/logger.ts`. All logs follow this format:

```json
{
  "timestamp": "2025-01-17T12:34:56.789Z",
  "level": "info",
  "message": "User created successfully",
  "userId": "user-123",
  "environment": "production"
}
```

### Log Levels
- `debug`: Detailed diagnostic information
- `info`: General information about application flow
- `warn`: Potential issues that don't affect operation
- `error`: Errors that occurred during operation

### Log Aggregation
Logs are aggregated using Loki with the following configuration in `docker/loki-config.yml`:

```yaml
auth_enabled: false
server:
  http_listen_port: 3100
  grpc_listen_port: 9096
```

## Distributed Tracing

### Jaeger Integration
Distributed tracing is set up with Jaeger for tracking requests across services:

- Jaeger UI: `http://localhost:16686`
- OTLP gRPC endpoint: `http://jaeger:4317`
- OTLP HTTP endpoint: `http://jaeger:4318`

### Tracing Setup
To enable distributed tracing:
1. Configure your services to export traces to Jaeger
2. Use standard trace context propagation
3. Implement custom spans for critical operations

## Dashboard Configuration

### Grafana Dashboards
Grafana dashboards are defined in `docker/app-metrics-dashboard.json` and include:

- **Requests Overview**: Displays request rate over time
- **Error Rate**: Shows error rate over time
- **Application Uptime**: Current application uptime
- **Memory Usage**: Heap memory usage over time

### Custom Dashboards
To create custom dashboards:
1. Access Grafana at `http://localhost:3000`
2. Use the dashboard editor to create new visualizations
3. Use Prometheus as the data source
4. Use the provided metrics for queries

## Alerting

### Alert Configuration
Alerts are configured in `docker/alert-rules.yml` with different severity levels:
- `critical`: Immediate action required
- `warning`: Monitor and investigate

### Alert Notification
Alerts are sent to AlertManager which can forward notifications to:
- Email
- Slack
- PagerDuty
- Custom webhooks

## Monitoring Procedures

### Daily Monitoring Tasks
1. **Check service health**:
   ```bash
   curl -f http://localhost:3000/api/health
   ```

2. **Review metrics dashboard**:
   - Check request rates and error rates
   - Monitor resource utilization
   - Verify no critical alerts are firing

3. **Review logs**:
   - Check for error patterns
   - Monitor for security-related events
   - Verify log volume is normal

### Weekly Monitoring Tasks
1. **Performance analysis**:
   - Review slow queries
   - Analyze response time trends
   - Check for resource bottlenecks

2. **Alert review**:
   - Verify alert rules are working correctly
   - Review false positive rates
   - Adjust thresholds if necessary

3. **System health**:
   - Check overall system health
   - Review monitoring system performance
   - Verify backup of monitoring data

### Monthly Monitoring Tasks
1. **Capacity planning**:
   - Analyze growth trends
   - Plan resource scaling
   - Review monitoring retention policies

2. **Documentation review**:
   - Update monitoring documentation
   - Review and update runbooks
   - Update alert thresholds based on usage patterns

## Troubleshooting

### Common Monitoring Issues

#### Metrics Not Appearing
- Verify the `/api/metrics` endpoint is accessible
- Check Prometheus target status in the UI
- Ensure the application is properly exposing metrics

#### High Memory Usage
- Check for memory leaks in the application
- Monitor garbage collection metrics
- Review application logs for memory-intensive operations

#### Missing Logs
- Verify Loki is running and accessible
- Check log configuration in the application
- Ensure proper log format and structure

#### High Error Rates
- Check application logs for error details
- Review error patterns and common causes
- Verify external dependencies are available

### Diagnostic Commands

#### Check Application Metrics Endpoint
```bash
curl http://localhost:3000/api/metrics
```

#### Check Prometheus Targets
```bash
curl http://localhost:9090/api/v1/targets
```

#### View Recent Logs in Loki
```bash
# Using Grafana Loki API
curl -G "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query'='{app="coding-agent"}' \
  --data 'limit=1000'
```

## Performance Tuning

### Monitoring Performance
- Adjust scrape intervals based on metric importance
- Implement metric retention policies
- Use Prometheus federation for large deployments

### Alert Optimization
- Set appropriate alert thresholds
- Implement alert grouping and aggregation
- Use recording rules for complex queries

## Security Considerations

### Metrics Security
- Secure metrics endpoints in production
- Implement authentication and authorization
- Use HTTPS for metric transmission

### Log Security
- Encrypt logs in transit and at rest
- Implement retention and deletion policies
- Sanitize sensitive information from logs

## Integration

### Adding New Metrics
To add new metrics:
1. Add metric collection to your code
2. Update the metrics endpoint to include your metrics
3. Add visualization to Grafana dashboard
4. Create alert rules if necessary

### Adding New Logs
To add new logs:
1. Use the structured logger in `@repo/lib/src/logger.ts`
2. Include relevant context information
3. Use appropriate log levels
4. Ensure sensitive data is not logged

## Best Practices

### Monitoring Best Practices
- Monitor both application and infrastructure metrics
- Set up alerts for important metrics
- Regularly review and update dashboards
- Document the meaning of key metrics

### Logging Best Practices
- Use structured logging with JSON format
- Include sufficient context for debugging
- Never log sensitive information
- Implement proper log rotation