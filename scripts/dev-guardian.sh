#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  IDM League — Double-Fork Guardian Process
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
#  WHY DOUBLE-FORK?
#  In a sandbox/container environment, background processes started with
#  simple `&` are children of the current shell. When the shell session
#  ends (e.g., the terminal tool finishes), SIGHUP propagates to all
#  children, killing the Next.js dev server.
#
#  The double-fork technique solves this:
#    1. Parent forks a child
#    2. Child forks a grandchild (the actual server)
#    3. Child exits → grandchild becomes orphan adopted by PID 1 (init)
#    4. Grandchild is now fully detached from any shell session
#    5. Guardian monitors grandchild and auto-restarts if it crashes
#
#  USAGE:
#    bun run dev:guardian        # Start with auto-restart
#    bun run dev:guardian:stop   # Stop the guardian and server
#    bun run dev:guardian:status # Check status
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

# ─── Configuration ─────────────────────────────────────────────────────
PORT=3000
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$PROJECT_DIR/.guardian"
SERVER_PID_FILE="$PID_DIR/server.pid"
GUARDIAN_PID_FILE="$PID_DIR/guardian.pid"
LOG_FILE="$PROJECT_DIR/dev.log"
GUARDIAN_LOG="$PID_DIR/guardian.log"
MAX_RESTARTS=10
RESTART_DELAY=3
HEALTH_CHECK_INTERVAL=10

# ─── Helper Functions ──────────────────────────────────────────────────
log()  { echo "[$(date '+%H:%M:%S')] [guardian] $1" >> "$GUARDIAN_LOG"; echo "[guardian] $1"; }
warn() { echo "[$(date '+%H:%M:%S')] [guardian] WARNING: $1" >> "$GUARDIAN_LOG"; echo "[guardian] $1"; }
err()  { echo "[$(date '+%H:%M:%S')] [guardian] ERROR: $1" >> "$GUARDIAN_LOG"; echo "[guardian] $1"; }
ok()   { echo "[$(date '+%H:%M:%S')] [guardian] $1" >> "$GUARDIAN_LOG"; echo "[guardian] $1"; }

# ─── Start Server with Double-Fork ─────────────────────────────────────
start_server() {
  log "Starting Next.js dev server on port $PORT (double-fork)..."

  # Clean stale PID file
  rm -f "$SERVER_PID_FILE"

  # Double-fork: spawn a detached process that is NOT our child
  # This prevents the server from receiving SIGHUP when any parent shell exits
  (
    # First fork: this subshell will fork again and exit
    (
      # Second fork: this is the actual server process
      # It becomes an orphan adopted by PID 1 (init)
      exec node "$PROJECT_DIR/node_modules/.bin/next" dev -p "$PORT" \
        >> "$LOG_FILE" 2>&1
    ) &
    # Capture the grandchild PID before the child exits
    echo $! > "$SERVER_PID_FILE"
    # First child exits immediately — grandchild is now an orphan
    exit 0
  ) &

  # Wait briefly for the PID file to be written
  local wait_count=0
  while [ ! -f "$SERVER_PID_FILE" ] && [ $wait_count -lt 15 ]; do
    sleep 0.5
    wait_count=$((wait_count + 1))
  done

  if [ ! -f "$SERVER_PID_FILE" ]; then
    err "Failed to capture server PID"
    return 1
  fi

  local pid
  pid=$(cat "$SERVER_PID_FILE")

  # Wait for the server to start responding
  local ready=0
  for i in $(seq 1 30); do
    if ! kill -0 "$pid" 2>/dev/null; then
      err "Server process died during startup!"
      return 1
    fi
    # Check if the server is responding to HTTP requests
    if curl -s -o /dev/null --max-time 3 "http://localhost:$PORT/" 2>/dev/null; then
      ready=1
      break
    fi
    sleep 1
  done

  if [ $ready -eq 1 ]; then
    ok "Server started (PID $pid, port $PORT)"
    return 0
  else
    warn "Server process alive but not responding yet (PID $pid) — may still be compiling"
    return 0
  fi
}

# ─── Health Check ──────────────────────────────────────────────────────
is_server_alive() {
  if [ ! -f "$SERVER_PID_FILE" ]; then
    return 1
  fi

  local pid
  pid=$(cat "$SERVER_PID_FILE" 2>/dev/null || echo "")

  if [ -z "$pid" ]; then
    return 1
  fi

  # Use kill -0 only — it's sufficient to check if a process exists
  # Note: Next.js reports as "MainThread" or "next-server", not "node"
  if ! kill -0 "$pid" 2>/dev/null; then
    return 1
  fi

  return 0
}

# ─── Stop Command ──────────────────────────────────────────────────────
stop_guardian() {
  # Stop the guardian
  if [ -f "$GUARDIAN_PID_FILE" ]; then
    local gpid
    gpid=$(cat "$GUARDIAN_PID_FILE" 2>/dev/null || echo "")
    if [ -n "$gpid" ] && kill -0 "$gpid" 2>/dev/null; then
      log "Stopping guardian (PID $gpid)..."
      kill "$gpid" 2>/dev/null || true
      sleep 1
      # Force kill if still alive
      kill -9 "$gpid" 2>/dev/null || true
    fi
    rm -f "$GUARDIAN_PID_FILE"
  fi

  # Stop the server
  if [ -f "$SERVER_PID_FILE" ]; then
    local pid
    pid=$(cat "$SERVER_PID_FILE" 2>/dev/null || echo "")
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      log "Stopping server (PID $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 2
      # Force kill if still alive
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$SERVER_PID_FILE"
  fi

  # Also kill anything on port 3000 as a safety net
  local port_pid
  port_pid=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$port_pid" ]; then
    log "Killing orphan on port $PORT: $port_pid"
    kill $port_pid 2>/dev/null || true
  fi

  echo "[guardian] Everything stopped"
  exit 0
}

# ─── Status Command ────────────────────────────────────────────────────
show_status() {
  echo ""
  echo "━━━ IDM League Guardian Status ━━━"

  # Guardian status
  if [ -f "$GUARDIAN_PID_FILE" ]; then
    local gpid
    gpid=$(cat "$GUARDIAN_PID_FILE" 2>/dev/null || echo "")
    if [ -n "$gpid" ] && kill -0 "$gpid" 2>/dev/null; then
      echo "  Guardian: RUNNING (PID $gpid)"
    else
      echo "  Guardian: DEAD (stale PID file)"
    fi
  else
    echo "  Guardian: NOT RUNNING"
  fi

  # Server status
  if [ -f "$SERVER_PID_FILE" ]; then
    local pid
    pid=$(cat "$SERVER_PID_FILE" 2>/dev/null || echo "")
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      local rss
      rss=$(ps -o rss= -p "$pid" 2>/dev/null | tr -d ' ' || echo "?")
      if [ "$rss" != "?" ] && [ -n "$rss" ]; then
        echo "  Server:  RUNNING (PID $pid, $((rss/1024))MB, port $PORT)"
      else
        echo "  Server:  RUNNING (PID $pid, port $PORT)"
      fi
    else
      echo "  Server:  DEAD (stale PID file)"
    fi
  else
    echo "  Server:  NOT RUNNING"
  fi

  # Quick HTTP check
  if curl -s -o /dev/null --max-time 3 "http://localhost:$PORT/" 2>/dev/null; then
    echo "  HTTP:    OK (200)"
  else
    echo "  HTTP:    NOT RESPONDING"
  fi

  echo ""
}

# ─── Main Guardian Loop ────────────────────────────────────────────────
main() {
  # Handle command line arguments
  case "${1:-}" in
    stop)   stop_guardian ;;
    status) show_status; exit 0 ;;
  esac

  # Prevent running multiple guardians
  if [ -f "$GUARDIAN_PID_FILE" ]; then
    local existing_pid
    existing_pid=$(cat "$GUARDIAN_PID_FILE" 2>/dev/null || echo "")
    if [ -n "$existing_pid" ] && kill -0 "$existing_pid" 2>/dev/null; then
      err "Guardian already running (PID $existing_pid)"
      err "Run 'bun run dev:guardian:stop' first, or 'bun run dev:guardian:status'"
      exit 1
    fi
    rm -f "$GUARDIAN_PID_FILE"
  fi

  # Create PID directory
  mkdir -p "$PID_DIR"

  # Initialize guardian log
  > "$GUARDIAN_LOG"

  # Kill any existing server on our port
  local existing
  existing=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$existing" ]; then
    warn "Port $PORT is in use — killing existing process..."
    kill $existing 2>/dev/null || true
    sleep 2
  fi

  # ─── SELF-DETACH: Make this guardian script itself survive shell exits ───
  # We write our PID to the file FIRST, then the rest of the script runs
  # even if the parent shell dies (because we trap signals and the double-fork
  # server is already detached).
  echo $$ > "$GUARDIAN_PID_FILE"

  # Register signal handlers — keep the guardian alive
  trap 'log "Received signal — shutting down"; stop_guardian' SIGINT SIGTERM SIGQUIT
  trap '' SIGHUP  # Ignore SIGHUP (shell disconnect)

  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "  IDM League — Double-Fork Guardian"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Guardian PID: $$"
  log "Project: $PROJECT_DIR"
  log "Port: $PORT"
  log "Max restarts: $MAX_RESTARTS"
  log ""

  # Start the server
  restart_count=0

  if ! start_server; then
    err "Failed to start server on first attempt!"
    exit 1
  fi

  # ─── Guardian Watch Loop ────────────────────────────────────────────
  log "Guardian is watching... (Ctrl+C to stop)"
  log ""

  while true; do
    sleep "$HEALTH_CHECK_INTERVAL"

    if is_server_alive; then
      # Server is alive — periodic HTTP health check
      if ! curl -s -o /dev/null --max-time 5 "http://localhost:$PORT/" 2>/dev/null; then
        warn "Server alive but not responding to HTTP — may be compiling..."
      fi
    else
      # Server is dead!
      err "Server process DIED!"
      restart_count=$((restart_count + 1))

      if [ $restart_count -gt $MAX_RESTARTS ]; then
        err "Max restarts ($MAX_RESTARTS) exceeded. Giving up."
        err "Check $LOG_FILE for error details."
        exit 1
      fi

      warn "Restart attempt $restart_count/$MAX_RESTARTS in ${RESTART_DELAY}s..."
      sleep "$RESTART_DELAY"

      # Kill anything on the port
      local existing
      existing=$(lsof -ti :$PORT 2>/dev/null || true)
      if [ -n "$existing" ]; then
        warn "Killing orphan on port $PORT..."
        kill $existing 2>/dev/null || true
        sleep 2
      fi

      if start_server; then
        ok "Server restarted! (attempt $restart_count)"
      else
        err "Restart failed — will retry on next check cycle"
      fi
    fi
  done
}

main "$@"
