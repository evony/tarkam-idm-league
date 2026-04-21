#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# dev-guardian.sh — Next.js dev server supervisor using DOUBLE-FORK
#
# Architecture:
#   Guardian (this script) ──fork──► Monitor child
#     Monitor child ──fork──► Server process (Next.js)
#       Server process becomes child of PID 1 (init/tini)
#
# Why double-fork?
#   1. Fork #1 (guardian → monitor): Guardian can restart monitor if it dies
#   2. Fork #2 (monitor → server): Server detaches from monitor's process group
#      - If server crashes, monitor detects it and can restart
#      - Server is immune to terminal SIGHUP (detached from session)
#      - Monitor can kill server cleanly without orphaned processes
#   3. Guardian never dies from server crashes — always can re-spawn monitor
#
# Features:
#   - Auto-restart on crash with exponential backoff
#   - Crash rate limiting (stops after N crashes in T seconds)
#   - Graceful shutdown on SIGTERM/SIGINT
#   - Port conflict detection and cleanup
#   - Health check polling
# ═══════════════════════════════════════════════════════════════════════

set -uo pipefail

PORT=3000
MAX_RESTARTS=10
BASE_DELAY=3
MAX_DELAY=30
CRASH_WINDOW=60
CRASH_COUNT=0
CRASH_WINDOW_START=$(date +%s)
PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/dev.log"
HEALTH_URL="http://localhost:$PORT/"
MONITOR_PID=""
SERVER_PID=""

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

log()  { echo -e "${CYAN}[guardian]${NC} $*"; }
warn() { echo -e "${YELLOW}[guardian]${NC} $*"; }
err()  { echo -e "${RED}[guardian]${NC} $*" >&2; }
ok()   { echo -e "${GREEN}[guardian]${NC} $*"; }
dim()  { echo -e "${DIM}[guardian]${NC} $*"; }

# ─── Kill any existing server on the port ───
kill_existing() {
  local pids
  pids=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$pids" ]; then
    warn "Port $PORT already in use by PID(s): $pids"
    log "Killing existing process(es)..."
    echo "$pids" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    pids=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
      sleep 1
    fi
    ok "Port $PORT cleared"
  fi
}

# ─── Cleanup on exit ───
cleanup() {
  log "Shutting down..."
  # Kill monitor if running
  if [ -n "$MONITOR_PID" ] && kill -0 "$MONITOR_PID" 2>/dev/null; then
    log "Sending SIGTERM to monitor (PID $MONITOR_PID)..."
    kill -TERM "$MONITOR_PID" 2>/dev/null || true
    # Wait for monitor to clean up server
    for i in $(seq 1 20); do
      if ! kill -0 "$MONITOR_PID" 2>/dev/null; then break; fi
      sleep 0.5
    done
    if kill -0 "$MONITOR_PID" 2>/dev/null; then
      kill -9 "$MONITOR_PID" 2>/dev/null || true
    fi
  fi
  # Kill any remaining server on port
  kill_existing
  ok "Goodbye!"
  exit 0
}

trap cleanup SIGTERM SIGINT SIGQUIT

# ─── Monitor function (runs as Fork #1 child) ───
# This function spawns the actual server (Fork #2) and watches it.
run_monitor() {
  local restart_count=0

  # Monitor's own cleanup
  monitor_cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
      kill -TERM "$SERVER_PID" 2>/dev/null || true
      for i in $(seq 1 10); do
        if ! kill -0 "$SERVER_PID" 2>/dev/null; then break; fi
        sleep 0.5
      done
      if kill -0 "$SERVER_PID" 2>/dev/null; then
        kill -9 "$SERVER_PID" 2>/dev/null || true
      fi
    fi
    exit 0
  }
  trap monitor_cleanup SIGTERM SIGINT SIGQUIT

  while true; do
    cd "$PROJECT_DIR"
    > "$LOG_FILE"

    # ─── FORK #2: Spawn the actual Next.js server ───
    # Use setsid to create new session (fully detached from terminal)
    # This is the "second fork" — the server runs in its own session
    log "Starting Next.js dev server (fork #2)..."
    setsid bun run dev >> "$LOG_FILE" 2>&1 &
    SERVER_PID=$!

    log "Server PID: $SERVER_PID, monitoring..."

    # Wait for server to be ready (up to 60s)
    local attempt=0
    while [ $attempt -lt 60 ]; do
      if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        break
      fi
      if curl -sf -o /dev/null "$HEALTH_URL" 2>/dev/null; then
        ok "Server is ready! $HEALTH_URL"
        break
      fi
      attempt=$((attempt + 1))
      sleep 1
    done

    # Wait for server process to exit
    while kill -0 "$SERVER_PID" 2>/dev/null; do
      sleep 2
    done

    wait "$SERVER_PID" 2>/dev/null
    local exit_code=$?
    err "Server exited with code $exit_code (restart #$((restart_count + 1)))"

    # Show last lines of log for debugging
    dim "Last log lines:"
    tail -5 "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do dim "  $line"; done

    restart_count=$((restart_count + 1))

    # Exponential backoff: 3s, 6s, 12s, 24s, 30s max
    local delay=$(( BASE_DELAY * (2 ** (restart_count - 1)) ))
    if [ $delay -gt $MAX_DELAY ]; then delay=$MAX_DELAY; fi

    warn "Restarting in ${delay}s..."
    sleep $delay

    # Kill any lingering process on port before restart
    kill_existing
  done
}

# ─── Main guardian loop ───
main() {
  ok "╔══════════════════════════════════════════════╗"
  ok "║  IDM League Dev Guardian v2.0 (double-fork)  ║"
  ok "╚══════════════════════════════════════════════╝"
  log "Port: $PORT | Max restarts: $MAX_RESTARTS/${CRASH_WINDOW}s"
  echo ""

  kill_existing

  while true; do
    # ─── FORK #1: Spawn monitor as child process ───
    log "Spawning monitor process (fork #1)..."
    run_monitor &
    MONITOR_PID=$!

    # Wait for monitor to exit
    while kill -0 "$MONITOR_PID" 2>/dev/null; do
      sleep 2
    done

    wait "$MONITOR_PID" 2>/dev/null
    local exit_code=$?
    err "Monitor exited with code $exit_code"

    # ─── Crash rate limiting ───
    local now=$(date +%s)
    local elapsed=$((now - CRASH_WINDOW_START))

    if [ $elapsed -gt $CRASH_WINDOW ]; then
      CRASH_COUNT=1
      CRASH_WINDOW_START=$now
    else
      CRASH_COUNT=$((CRASH_COUNT + 1))
    fi

    if [ $CRASH_COUNT -ge $MAX_RESTARTS ]; then
      err "Too many crashes ($CRASH_COUNT in ${elapsed}s). Stopping guardian."
      err "Check $LOG_FILE for errors."
      exit 1
    fi

    warn "Re-spawning monitor in ${BASE_DELAY}s... (crash $CRASH_COUNT/$MAX_RESTARTS in window)"
    sleep $BASE_DELAY

    # Clean up any leftover server on port
    kill_existing
  done
}

main
