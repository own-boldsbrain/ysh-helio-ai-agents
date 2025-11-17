#!/bin/bash
PID_FILE="/tmp/next-dev-server.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Stopping server (PID: $PID)..."
        kill "$PID"
        rm -f "$PID_FILE"
        echo "✅ Server stopped"
    else
        echo "Server not running (stale PID file removed)"
        rm -f "$PID_FILE"
    fi
else
    echo "Server is not running (no PID file found)"
fi
