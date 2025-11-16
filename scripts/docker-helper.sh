#!/bin/bash

# docker-helper.sh - Helper script for common Docker operations
# Usage: ./scripts/docker-helper.sh [command]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

show_help() {
    echo "Docker Helper Script"
    echo ""
    echo "Usage: ./scripts/docker-helper.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all containers"
    echo "  stop        - Stop all containers"
    echo "  restart     - Restart all containers"
    echo "  status      - Show container status"
    echo "  logs        - Show container logs (follow)"
    echo "  logs-db     - Show PostgreSQL logs only"
    echo "  clean       - Stop and remove all containers and volumes"
    echo "  rebuild     - Clean and rebuild everything"
    echo "  shell       - Open shell in PostgreSQL container"
    echo "  psql        - Connect to PostgreSQL with psql"
    echo "  backup      - Backup PostgreSQL database"
    echo "  restore     - Restore PostgreSQL database from backup"
    echo ""
}

start_containers() {
    print_info "Starting containers..."
    docker-compose up -d
    print_success "Containers started"
    docker-compose ps
}

stop_containers() {
    print_info "Stopping containers..."
    docker-compose down
    print_success "Containers stopped"
}

restart_containers() {
    print_info "Restarting containers..."
    docker-compose restart
    print_success "Containers restarted"
    docker-compose ps
}

show_status() {
    print_info "Container status:"
    docker-compose ps
}

show_logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

show_db_logs() {
    print_info "Showing PostgreSQL logs (Ctrl+C to exit)..."
    docker-compose logs -f postgres
}

clean_containers() {
    print_warning "This will remove all containers and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        print_success "Cleanup complete"
    else
        print_info "Cancelled"
    fi
}

rebuild_containers() {
    print_warning "This will rebuild everything from scratch!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        print_info "Pulling images..."
        docker-compose pull
        print_info "Building..."
        docker-compose build --no-cache
        print_info "Starting..."
        docker-compose up -d
        print_success "Rebuild complete"
        docker-compose ps
    else
        print_info "Cancelled"
    fi
}

open_shell() {
    print_info "Opening shell in PostgreSQL container..."
    docker-compose exec postgres sh
}

connect_psql() {
    print_info "Connecting to PostgreSQL..."
    docker-compose exec postgres psql -U postgres -d coding_agent
}

backup_db() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Creating backup: $BACKUP_FILE"
    docker-compose exec -T postgres pg_dump -U postgres coding_agent > "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
}

restore_db() {
    if [ -z "$2" ]; then
        print_error "Please specify backup file"
        echo "Usage: ./scripts/docker-helper.sh restore [backup_file.sql]"
        exit 1
    fi
    
    BACKUP_FILE="$2"
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "This will restore database from: $BACKUP_FILE"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restoring database..."
        docker-compose exec -T postgres psql -U postgres coding_agent < "$BACKUP_FILE"
        print_success "Database restored"
    else
        print_info "Cancelled"
    fi
}

# Main script
COMMAND="${1:-help}"

case "$COMMAND" in
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-db)
        show_db_logs
        ;;
    clean)
        clean_containers
        ;;
    rebuild)
        rebuild_containers
        ;;
    shell)
        open_shell
        ;;
    psql)
        connect_psql
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$@"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
