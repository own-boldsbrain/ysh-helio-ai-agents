#!/bin/bash
set -e

PROJECT_DIR="/home/rookie/projects/coding-agent-template"
LOG_FILE="/tmp/next-dev-server.log"
PID_FILE="/tmp/next-dev-server.pid"

cd "$PROJECT_DIR"

# Check if server is already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Server is already running (PID: $OLD_PID)"
        echo "Log: $LOG_FILE"
        echo "To stop: kill $OLD_PID"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# Clean up old logs
> "$LOG_FILE"

echo "Starting Next.js development server..."
echo "Log file: $LOG_FILE"
echo "PID file: $PID_FILE"

# Start server in background with environment variables
cd "$PROJECT_DIR"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "Please create .env.local with your configuration"
    exit 1
fi

echo "✅ Loading environment variables from .env.local..."
# Export environment variables from .env.local
export $(cat .env.local | grep -v "^#" | xargs)

# Start from root directory so Next.js loads .env.local
nohup pnpm --filter @repo/web dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Save PID
echo "$SERVER_PID" > "$PID_FILE"

# Wait a bit and check if server started
sleep 3

if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo "✅ Server started successfully (PID: $SERVER_PID)"
    echo ""
    echo "View logs: tail -f $LOG_FILE"
    echo "Stop server: kill $SERVER_PID"
    echo ""
    echo "Waiting for server to be ready..."
    
    # Wait for "Ready" message in logs
    for i in {1..30}; do
        if grep -q "Ready" "$LOG_FILE" 2>/dev/null; then
            echo "✅ Server is ready!"
            echo ""
            echo "Access at: http://localhost:3000"
            exit 0
        fi
        sleep 1
    done
    
    echo "⚠️  Server started but 'Ready' message not found yet"
    echo "Check logs: tail -f $LOG_FILE"
else
    echo "❌ Failed to start server"
    rm -f "$PID_FILE"
    exit 1
fi
