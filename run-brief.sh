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
  # Use Python for JSON construction — prevents breakage when $1 contains quotes or newlines
  SLACK_MSG="$1" python3 -c "
import json, urllib.request, os
data = json.dumps({'channel': os.environ['PROMETHEUS_CHANNEL'], 'text': os.environ['SLACK_MSG']}).encode()
req = urllib.request.Request('https://slack.com/api/chat.postMessage', data=data,
    headers={'Authorization': 'Bearer ' + os.environ['SLACK_BOT_TOKEN'], 'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as r: r.read()
" >> "$LOG_FILE" 2>&1 || true
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

PREFLIGHT_JSON=$(timeout 3m claude --dangerously-skip-permissions \
  --model claude-haiku-4-5-20251001 \
  --output-format json \
  -p "$(cat "$PROJECT_DIR/tasks/pre-flight.md")" < /dev/null 2>&1) || true

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
) || true

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Pre-flight — failed: '${FAILED}'" >> "$LOG_FILE"

if [ -n "$FAILED" ]; then
  slack_post "🚨 Brief aborted — retriever(s) down: ${FAILED}. The 9:11 AM brief did NOT run. Manual check required."
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PRE-FLIGHT FAILED. Brief aborted." >> "$LOG_FILE"
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Pre-flight passed. Launching brief..." >> "$LOG_FILE"
slack_post "✅ Pre-flight passed. Launching brief..."

# ── Generate RUN_ID here (not in Claude session) ─────────────────
RUN_ID=$(date +%Y%m%d-%H%M)
echo "$RUN_ID" > "$PROJECT_DIR/memory/last-run-id.txt"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] RUN_ID=$RUN_ID" >> "$LOG_FILE"
mkdir -p "$PROJECT_DIR/memory/runs/"

# ── Run the brief via Claude Code ───────────
BRIEF_PROMPT="⚠️ FRESH PIPELINE INVOCATION — ignore all prior session context and memory.
RUN_ID=${RUN_ID}
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
SLACK_USER_TOKEN=${SLACK_USER_TOKEN}
SLACK_TEAM_ID=${SLACK_TEAM_ID}
PROMETHEUS_CHANNEL=${PROMETHEUS_CHANNEL}
GRANOLA_AUTH_TOKEN=${GRANOLA_AUTH_TOKEN}

$(cat "$PROJECT_DIR/tasks/daily-brief.md")"

BRIEF_JSON=$(timeout 30m claude --dangerously-skip-permissions \
  --model claude-sonnet-4-6 \
  --output-format json \
  -p "$BRIEF_PROMPT" 2>&1) || true

echo "$BRIEF_JSON" >> "$LOG_FILE"

# ── Retry once on failure (empty output or non-zero exit) ───────
BRIEF_RESULT=$(echo "$BRIEF_JSON" | python3 -c "import json,sys,re; raw=sys.stdin.read(); m=re.search(r'\{\"type\"\s*:\s*\"result\"', raw); print('ok' if m else 'empty')" 2>/dev/null || echo "empty")
if [ "$BRIEF_RESULT" = "empty" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Brief returned empty output — retrying in 5 minutes..." >> "$LOG_FILE"
  slack_post "⚠️ Brief returned no output — retrying in 5 minutes (RUN_ID=${RUN_ID})..."
  sleep 300
  BRIEF_JSON=$(timeout 30m claude --dangerously-skip-permissions \
    --model claude-sonnet-4-6 \
    --output-format json \
    -p "$BRIEF_PROMPT" 2>&1) || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] RETRY ATTEMPT — output appended:" >> "$LOG_FILE"
  echo "$BRIEF_JSON" >> "$LOG_FILE"
fi

# ── Parse tokens + cost ──────────────────────
TOKEN_LINE=$(echo "$BRIEF_JSON" | python3 <<'PYEOF'
import json, sys, re
raw = sys.stdin.read()
try:
    m = re.search(r'\{"type"\s*:\s*"result"', raw)
    if m:
        raw = raw[m.start():]
    data, _ = json.JSONDecoder().raw_decode(raw)
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
) || true
echo "[TOKEN USAGE] $TOKEN_LINE" >> "$LOG_FILE"

# ── Extract and post run summary to #prometheus ──
SUMMARY=$(echo "$BRIEF_JSON" | python3 <<'PYEOF'
import json, sys, re
raw = sys.stdin.read()
try:
    m = re.search(r'\{"type"\s*:\s*"result"', raw)
    if m:
        raw = raw[m.start():]
    data, _ = json.JSONDecoder().raw_decode(raw)
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
) || true

# Append token line to summary
FULL_SUMMARY="${SUMMARY}

Tokens: ${TOKEN_LINE}"

slack_post "$FULL_SUMMARY"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Brief run complete." >> "$LOG_FILE"

# ── Run Monitor (self-healing) ───────────────
# RUN_ID already set above from date generation — do not re-read from file
if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "unknown" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Launching run monitor for RUN_ID=$RUN_ID..." >> "$LOG_FILE"
  timeout 15m claude --dangerously-skip-permissions \
    --model claude-sonnet-4-6 \
    --output-format json \
    -p "⚠️ FRESH INVOCATION — ignore all prior session context.
RUN_ID=${RUN_ID}
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
PROMETHEUS_CHANNEL=${PROMETHEUS_CHANNEL}

$(cat "$PROJECT_DIR/agents/run-monitor.md")" >> "$LOG_FILE" 2>&1 || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Run monitor complete." >> "$LOG_FILE"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: last-run-id.txt not found — run monitor skipped." >> "$LOG_FILE"
fi
