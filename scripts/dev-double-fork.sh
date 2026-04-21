#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  IDM League — Double-Fork Dev Server Launcher
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
#  WHY: In sandbox environments, `next dev` started as a child of the
#  shell gets killed when the shell session ends (SIGHUP propagation).
#
#  This script uses the double-fork technique to detach the Next.js
#  server from the shell session tree, making it an orphan adopted by
#  PID 1 (init). The server then survives shell disconnects.
#
#  For auto-restart on crash, use `bun run dev:guardian` instead.
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

PORT=3000
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$PROJECT_DIR/.guardian"
SERVER_PID_FILE="$PID_DIR/server.pid"
LOG_FILE="$PROJECT_DIR/dev.log"

# Create PID directory
mkdir -p "$PID_DIR"

# Kill any existing server on our port
existing=$(lsof -ti :$PORT 2>/dev/null || true)
if [ -n "$existing" ]; then
  echo "[double-fork] Killing existing process on port $PORT..."
  kill $existing 2>/dev/null || true
  sleep 2
fi

# Truncate log for fresh start
> "$LOG_FILE"

# Remove stale PID file
rm -f "$SERVER_PID_FILE"

echo "[double-fork] Starting Next.js dev server (double-fork, port $PORT)..."

# ─── DOUBLE FORK ───────────────────────────────────────────────────────
# Parent → forks child → child forks grandchild (server) → child exits
# Grandchild becomes orphan, adopted by init (PID 1), fully detached
(
  (
    exec node "$PROJECT_DIR/node_modules/.bin/next" dev -p "$PORT" \
      >> "$LOG_FILE" 2>&1
  ) &
  echo $! > "$SERVER_PID_FILE"
  exit 0
) &

# Wait for PID file
wait_count=0
while [ ! -f "$SERVER_PID_FILE" ] && [ $wait_count -lt 15 ]; do
  sleep 0.5
  wait_count=$((wait_count + 1))
done

if [ ! -f "$SERVER_PID_FILE" ]; then
  echo "[double-fork] ERROR: Failed to capture server PID"
  exit 1
fi

pid=$(cat "$SERVER_PID_FILE")
echo "[double-fork] Server launched (PID $pid)"

# Wait for the server to be ready
for i in $(seq 1 30); do
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "[double-fork] ERROR: Server process died during startup"
    exit 1
  fi
  if curl -s -o /dev/null --max-time 2 "http://localhost:$PORT/" 2>/dev/null; then
    echo "[double-fork] ✓ Server ready! (PID $pid, port $PORT)"
    echo "[double-fork] Log: $LOG_FILE"
    echo "[double-fork] PID file: $SERVER_PID_FILE"
    echo "[double-fork] To stop: kill $pid  or  bun run dev:guardian:stop"
    exit 0
  fi
  sleep 1
done

echo "[double-fork] Server process alive but not responding yet (PID $pid)"
echo "[double-fork] It may still be compiling. Check $LOG_FILE"
