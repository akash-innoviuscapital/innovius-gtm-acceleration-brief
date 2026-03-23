#!/bin/bash
# ─────────────────────────────────────────────
# Innovius Capital — Daily Brief Heartbeat
# Triggered by cron at 9:11 AM PT every weekday
# ─────────────────────────────────────────────

set -euo pipefail

PROJECT_DIR="/root/innovius-brief"
LOG_FILE="$PROJECT_DIR/memory/run.log"
LOCK_FILE="/tmp/innovius-brief.lock"

# ── Prevent duplicate runs ──────────────────
if [ -f "$LOCK_FILE" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] SKIPPED — previous run still in progress" >> "$LOG_FILE"
  exit 1
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# ── Log start ───────────────────────────────
echo "" >> "$LOG_FILE"
echo "════════════════════════════════════════" >> "$LOG_FILE"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Brief run starting..." >> "$LOG_FILE"

# ── Load environment variables ──────────────
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: .env file not found at $PROJECT_DIR/.env" >> "$LOG_FILE"
  exit 1
fi
set -a
source "$PROJECT_DIR/.env"
set +a

# ── Pull latest from GitHub ─────────────────
cd "$PROJECT_DIR"
git pull origin main >> "$LOG_FILE" 2>&1

# ── Run the brief via Claude Code ───────────
claude --dangerously-skip-permissions \
  --model claude-sonnet-4-6 \
  --task "$PROJECT_DIR/tasks/daily-brief.md" \
  >> "$LOG_FILE" 2>&1

# ── Log completion ───────────────────────────
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Brief run complete." >> "$LOG_FILE"
