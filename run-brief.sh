#!/bin/bash
# ─────────────────────────────────────────────
# Innovius Capital — Daily Brief Heartbeat
# Triggered by cron at 9:11 AM ET every weekday
# ─────────────────────────────────────────────

set -euo pipefail

PROJECT_DIR="/home/prometheus/innovius-brief"
LOG_FILE="$PROJECT_DIR/memory/run.log"
LOCK_FILE="/tmp/innovius-brief.lock"
PROMETHEUS_CHANNEL="C0AN3GW1SVC"

slack_post() {
  curl -s -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"${PROMETHEUS_CHANNEL}\",\"text\":\"$1\"}" >> "$LOG_FILE" 2>&1
}

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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: .env file not found" >> "$LOG_FILE"
  exit 1
fi
set -a
source "$PROJECT_DIR/.env"
set +a

cd "$PROJECT_DIR"

# ── Pre-flight health check ──────────────────
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Running pre-flight check..." >> "$LOG_FILE"
slack_post "🔍 Pre-flight starting..."

PREFLIGHT_JSON=$(claude --dangerously-skip-permissions \
  --model claude-haiku-4-5-20251001 \
  --output-format json \
  -p "$(cat "$PROJECT_DIR/tasks/pre-flight.md")" 2>&1) || true

FAILED=$(echo "$PREFLIGHT_JSON" | python3 - <<'PYEOF'
import json, sys, re
raw = sys.stdin.read()
result_text = ""
try:
    outer = json.loads(raw)
    result_text = outer.get("result", raw) if isinstance(outer, dict) else raw
except Exception:
    result_text = raw
match = re.search(r'\{[^{}]+\}', result_text)
if match:
    try:
        data = json.loads(match.group())
        print(",".join(data.get("failed", [])))
    except Exception:
        print("")  # parse error — don't abort
else:
    print("")  # no JSON found — don't abort
PYEOF
)

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Pre-flight — failed: '${FAILED}'" >> "$LOG_FILE"

if [ -n "$FAILED" ]; then
  slack_post "🚨 Brief aborted — retriever(s) down: ${FAILED}. The 9:11 AM brief did NOT run. Manual check required."
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PRE-FLIGHT FAILED. Brief aborted." >> "$LOG_FILE"
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Pre-flight passed. Launching brief..." >> "$LOG_FILE"
slack_post "✅ Pre-flight passed. Launching brief..."

# ── Run the brief via Claude Code ───────────
BRIEF_JSON=$(claude --dangerously-skip-permissions \
  --model claude-sonnet-4-6 \
  --output-format json \
  -p "$(cat "$PROJECT_DIR/tasks/daily-brief.md")" 2>&1) || true

echo "$BRIEF_JSON" >> "$LOG_FILE"

# ── Parse tokens + cost ──────────────────────
TOKEN_LINE=$(echo "$BRIEF_JSON" | python3 - <<'PYEOF'
import json, sys
raw = sys.stdin.read()
try:
    data = json.loads(raw)
    usage = data.get("usage", {})
    inp   = usage.get("input_tokens", 0)
    out   = usage.get("output_tokens", 0)
    cache_read   = usage.get("cache_read_input_tokens", 0)
    cache_create = usage.get("cache_creation_input_tokens", 0)
    cost  = data.get("total_cost_usd", 0)
    print(f"input={inp:,}  output={out:,}  cache_read={cache_read:,}  cache_write={cache_create:,}  cost=${cost:.4f}")
except Exception:
    print("could not parse token usage")
PYEOF
)
echo "[TOKEN USAGE] $TOKEN_LINE" >> "$LOG_FILE"

# ── Extract and post run summary to #prometheus ──
SUMMARY=$(echo "$BRIEF_JSON" | python3 - <<'PYEOF'
import json, sys, re
raw = sys.stdin.read()
try:
    data = json.loads(raw)
    result = data.get("result", "")
    # Extract the Step 6 summary block (between "Brief run complete" and end)
    match = re.search(r'(✅ Brief run complete.*?)(?:\n\n|\Z)', result, re.DOTALL)
    if match:
        print(match.group(1).strip())
    else:
        # Fallback: last 1500 chars of result
        print(result[-1500:].strip())
except Exception:
    print("Brief complete — see run.log for details")
PYEOF
)

# Append token line to summary
FULL_SUMMARY="${SUMMARY}

Tokens: ${TOKEN_LINE}"

slack_post "$FULL_SUMMARY"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Brief run complete." >> "$LOG_FILE"

# ── Run Monitor (self-healing) ───────────────
RUN_ID=$(cat "$PROJECT_DIR/memory/last-run-id.txt" 2>/dev/null || echo "unknown")
if [ "$RUN_ID" != "unknown" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Launching run monitor for RUN_ID=$RUN_ID..." >> "$LOG_FILE"
  claude --dangerously-skip-permissions \
    --model claude-sonnet-4-6 \
    --output-format json \
    -p "RUN_ID=${RUN_ID}

$(cat "$PROJECT_DIR/agents/run-monitor.md")" >> "$LOG_FILE" 2>&1 || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Run monitor complete." >> "$LOG_FILE"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: last-run-id.txt not found — run monitor skipped." >> "$LOG_FILE"
fi
