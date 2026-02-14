#!/usr/bin/env bash
# Restart both backend and frontend (Plaid-Bank-Transfer)
# Author: Giuseppe Bosi

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKEND_PORT=4001
FRONTEND_PORT=4000

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti ":$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping process(es) on port $port (PIDs: $pids)"
    echo "$pids" | xargs -r kill 2>/dev/null || true
    sleep 1
    # Force kill if still running
    pids=$(lsof -ti ":$port" 2>/dev/null || true)
    [ -n "$pids" ] && echo "$pids" | xargs -r kill -9 2>/dev/null || true
  fi
}

echo "=== Stopping backend (port $BACKEND_PORT) and frontend (port $FRONTEND_PORT) ==="
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
sleep 1

echo "=== Starting backend ==="
cd "$SCRIPT_DIR/backend"
node server.js &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID), http://localhost:$BACKEND_PORT"

echo "=== Starting frontend ==="
cd "$SCRIPT_DIR/frontend"
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID), http://localhost:$FRONTEND_PORT"

echo ""
echo "Done. Backend: http://localhost:$BACKEND_PORT | Frontend: http://localhost:$FRONTEND_PORT"
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
