#!/bin/bash

# Docker Container Monitoring Script
# Monitors containers health and resource usage

echo "========================================="
echo "Docker Containers Monitoring"
echo "Started at: $(date)"
echo "========================================="
echo ""

# Monitor interval in seconds
INTERVAL=${1:-30}

# Log file
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/docker-monitor-$(date +%Y%m%d).log"

echo "Monitoring every ${INTERVAL} seconds..."
echo "Log file: $LOG_FILE"
echo ""

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check container health
check_health() {
    log "=== Container Status ==="
    docker-compose ps | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to show resource usage
show_stats() {
    log "=== Resource Usage ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check unhealthy containers
check_unhealthy() {
    UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")
    if [ ! -z "$UNHEALTHY" ]; then
        log "⚠️  ALERT: Unhealthy containers detected:"
        echo "$UNHEALTHY" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
    fi
}

# Main monitoring loop
while true; do
    check_health
    show_stats
    check_unhealthy
    
    log "----------------------------------------"
    log "Next check in ${INTERVAL} seconds..."
    echo ""
    
    sleep "$INTERVAL"
done
