#!/usr/bin/env bash
# Stop backend and frontend servers (Plaid-Bank-Transfer)
# Author: Giuseppe Bosi

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
    pids=$(lsof -ti ":$port" 2>/dev/null || true)
    [ -n "$pids" ] && echo "$pids" | xargs -r kill -9 2>/dev/null || true
  else
    echo "No process on port $port"
  fi
}

echo "=== Stopping backend (port $BACKEND_PORT) and frontend (port $FRONTEND_PORT) ==="
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
echo "Done."
