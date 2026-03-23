#!/bin/bash
# ─────────────────────────────────────────────
# Innovius Capital — Retriever Smoke Test
# Triggered by cron every 6 hours
# Posts health status to #prometheus in Slack
# ─────────────────────────────────────────────

set -euo pipefail

PROJECT_DIR="/home/prometheus/innovius-brief"
LOG_FILE="$PROJECT_DIR/memory/run.log"
LOCK_FILE="/tmp/innovius-smoke.lock"

# ── Prevent duplicate runs ──────────────────
if [ -f "$LOCK_FILE" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] SMOKE SKIPPED — previous run still in progress" >> "$LOG_FILE"
  exit 1
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# ── Log start ───────────────────────────────
echo "" >> "$LOG_FILE"
echo "────────────────────────────────────────" >> "$LOG_FILE"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Smoke test starting..." >> "$LOG_FILE"

# ── Load environment variables ──────────────
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: .env file not found at $PROJECT_DIR/.env" >> "$LOG_FILE"
  exit 1
fi
set -a
source "$PROJECT_DIR/.env"
set +a

# ── Extract Granola auth token ──────────────
GRANOLA_AUTH_TOKEN=$(python3 -c "
import json
with open('/home/prometheus/.claude/.credentials.json') as f:
    data = json.load(f)
print(data.get('claudeAiOauth', {}).get('accessToken', ''))
")
export GRANOLA_AUTH_TOKEN

# ── Run smoke test via Claude Code ──────────
cd "$PROJECT_DIR"
claude --dangerously-skip-permissions \
  --model claude-haiku-4-5-20251001 \
  -p "$(cat "$PROJECT_DIR/tasks/smoke-test.md")" \
  >> "$LOG_FILE" 2>&1

# ── Log completion ───────────────────────────
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Smoke test complete." >> "$LOG_FILE"
