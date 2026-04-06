#!/bin/bash
# ─────────────────────────────────────────────
# Prometheus Slack Bot — Watchdog
# Runs every 15 minutes via cron.
# Alerts and restarts the bot if it's not running.
# ─────────────────────────────────────────────

PROJECT_DIR="/home/prometheus/innovius-brief"
LOG_FILE="$PROJECT_DIR/memory/server.log"

if pgrep -f "slack-bot.py" > /dev/null; then
  exit 0
fi

# Process is down — load env and alert
set -a
source "$PROJECT_DIR/.env"
set +a

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WATCHDOG: bot not running — restarting" >> "$LOG_FILE"

SLACK_MSG="🚨 Prometheus Slack bot was down — watchdog restarting it now." \
python3 -c "
import json, urllib.request, os
data = json.dumps({'channel': 'C0AN3GW1SVC', 'text': os.environ['SLACK_MSG']}).encode()
req = urllib.request.Request('https://slack.com/api/chat.postMessage', data=data,
    headers={'Authorization': 'Bearer ' + os.environ['SLACK_BOT_TOKEN'], 'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as r: r.read()
" >> "$LOG_FILE" 2>&1 || true

cd "$PROJECT_DIR"
nohup python3 slack-bot.py >> "$LOG_FILE" 2>&1 &

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WATCHDOG: bot restarted (PID $!)" >> "$LOG_FILE"
