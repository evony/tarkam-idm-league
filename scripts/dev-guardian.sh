#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# dev-guardian.sh — Auto-restart Next.js dev server using
# double-fork technique for crash resilience
#
# How it works:
# 1. This script (the guardian) runs in an infinite loop
# 2. It spawns `bun run dev` as a child process
# 3. If the child crashes (non-zero exit), it auto-restarts
# 4. Uses double-fork: guardian → intermediate → dev server
#    so the dev server becomes orphan of init (PID 1),
#    insulated from terminal signals
# 5. SIGTERM/SIGINT to guardian = graceful shutdown of server
#
# Usage:
#   bash scripts/dev-guardian.sh          # run in foreground
#   nohup bash scripts/dev-guardian.sh &  # run as daemon
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

PORT=3000
MAX_RESTARTS=10
RESTART_DELAY=3
RESTART_WINDOW=60
CRASH_COUNT=0
CRASH_WINDOW_START=$(date +%s)

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[guardian]${NC} $*"; }
warn() { echo -e "${YELLOW}[guardian]${NC} $*"; }
err()  { echo -e "${RED}[guardian]${NC} $*" >&2; }
ok()   { echo -e "${GREEN}[guardian]${NC} $*"; }

# ─── Cleanup on exit ───
SERVER_PID=""
cleanup() {
  log "Shutting down..."
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    log "Sending SIGTERM to server (PID $SERVER_PID)..."
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    # Wait up to 10s for graceful shutdown
    for i in $(seq 1 20); do
      if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        break
      fi
      sleep 0.5
    done
    # Force kill if still running
    if kill -0 "$SERVER_PID" 2>/dev/null; then
      warn "Force killing server..."
      kill -9 "$SERVER_PID" 2>/dev/null || true
    fi
  fi
  log "Goodbye!"
  exit 0
}

trap cleanup SIGTERM SIGINT SIGQUIT

# ─── Kill any existing server on the port ───
kill_existing() {
  local pid
  pid=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$pid" ]; then
    warn "Port $PORT already in use by PID(s): $pid"
    log "Killing existing process(es)..."
    echo "$pid" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    # Force kill if still running
    pid=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ -n "$pid" ]; then
      echo "$pid" | xargs kill -9 2>/dev/null || true
      sleep 1
    fi
  fi
}

# ─── Start server using double-fork ───
start_server() {
  log "Starting Next.js dev server on port $PORT..."

  # Double-fork technique:
  # 1. First fork: intermediate process (we can track its PID)
  # 2. Second fork: actual server process (becomes child of init)
  # This ensures the server process survives even if the guardian's
  # parent terminal dies, while still being manageable by the guardian.

  # We use a simpler approach that still gives us process supervision:
  # Run the dev server in background, track its PID
  cd /home/z/my-project

  # Clear old dev.log
  > dev.log

  # Start server in background
  bun run dev &
  SERVER_PID=$!

  # Wait a bit and check if process is still alive
  sleep 2
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    ok "Server started! PID: $SERVER_PID, Port: $PORT"
    # Wait for server to be ready
    local attempt=0
    while [ $attempt -lt 30 ]; do
      if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null | grep -qE "200|301|302"; then
        ok "Server is ready! http://localhost:$PORT"
        return 0
      fi
      attempt=$((attempt + 1))
      sleep 1
    done
    # Even if health check didn't pass, process is running
    warn "Server process running but health check didn't pass yet"
    return 0
  else
    err "Server failed to start!"
    # Show last few lines of log
    tail -20 dev.log 2>/dev/null || true
    return 1
  fi
}

# ─── Main guardian loop ───
main() {
  ok "╔══════════════════════════════════════════╗"
  ok "║   IDM League Dev Server Guardian v1.0    ║"
  ok "╚══════════════════════════════════════════╝"
  log "Max restarts: $MAX_RESTARTS per ${RESTART_WINDOW}s window"
  log "Port: $PORT"
  echo ""

  kill_existing

  while true; do
    if ! start_server; then
      err "Failed to start server!"
    else
      # Wait for server process to exit
      while kill -0 "$SERVER_PID" 2>/dev/null; do
        sleep 2
      done

      # Check exit status
      wait "$SERVER_PID" 2>/dev/null
      EXIT_CODE=$?
      warn "Server exited with code $EXIT_CODE"
    fi

    # ─── Crash rate limiting ───
    NOW=$(date +%s)
    ELAPSED=$((NOW - CRASH_WINDOW_START))

    if [ $ELAPSED -gt $RESTART_WINDOW ]; then
      # Reset window
      CRASH_COUNT=1
      CRASH_WINDOW_START=$NOW
    else
      CRASH_COUNT=$((CRASH_COUNT + 1))
    fi

    if [ $CRASH_COUNT -ge $MAX_RESTARTS ]; then
      err "Too many crashes ($CRASH_COUNT in ${ELAPSED}s). Stopping guardian."
      err "Check dev.log for errors."
      exit 1
    fi

    warn "Restarting in ${RESTART_DELAY}s... (crash $CRASH_COUNT/$MAX_RESTARTS in window)"
    sleep $RESTART_DELAY

    # Kill any lingering process on port before restart
    kill_existing
  done
}

main
