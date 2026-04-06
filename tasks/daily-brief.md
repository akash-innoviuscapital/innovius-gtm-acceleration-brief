# Daily Portfolio Intelligence Brief — Orchestrator

## Overview
This is the master task file for the Innovius Capital daily portfolio intelligence brief. It runs every morning at 9:11 AM ET via cron. It spawns four retrieval sub-agents in parallel, passes their output to a Synthesizer, then a Validator, writes the final brief to disk, and prints a run summary.

All context about Akash, Innovius, portfolio companies, and the canonical person-company roster is in CLAUDE.md — loaded automatically at session start.

---

## Step 0 — Confirm Environment

⚠️ **FRESH INVOCATION OVERRIDE**: You are running as a headless pipeline agent. Ignore ALL prior session context, conversation history, or memory from previous runs. Do not summarize, continue, or reference any previous run. Start from Step 0 immediately and execute every step in sequence.

Your RUN_ID and key env vars are provided in the header above this task file. Use them exactly as given — do not regenerate the RUN_ID.

Verify the following environment variables are available (passed in the header):
- SLACK_BOT_TOKEN
- PROMETHEUS_CHANNEL
- GRANOLA_AUTH_TOKEN

Also verify these are available from the MCP session or environment:
- SLACK_USER_TOKEN
- SLACK_TEAM_ID
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

If critical vars are missing, log the error to /home/prometheus/innovius-brief/memory/error.log and continue (do not abort — the pipeline will note missing sources).

After generating the RUN_ID, initialize the memory database and read open carry-overs:
```bash
python3 << 'PYEOF'
import sqlite3
db = "/home/prometheus/innovius-brief/memory/memory.db"
conn = sqlite3.connect(db)
with open("/home/prometheus/innovius-brief/memory/schema.sql") as f:
    conn.executescript(f.read())
rows = conn.execute("""
    SELECT id, company, content, date_created,
           CAST(julianday('now') - julianday(date_created) AS INTEGER) as days_open
    FROM actions WHERE checked=0 ORDER BY date_created
""").fetchall()
print(f"OPEN_CARRY_OVERS={len(rows)}")
oldest = max((r[4] for r in rows), default=0)
print(f"OLDEST_CARRY_OVER_DAYS={oldest}")
for r in rows:
    print(f"  [ID={r[0]}] [{r[1]}] Day {r[4]}: {r[2][:80]}")
conn.close()
PYEOF
```
Store the `OPEN_CARRY_OVERS` and `OLDEST_CARRY_OVER_DAYS` values — pass them to the Synthesizer in the prompt header and use them in Steps 2.5 and 5.

---

## Step 1 — Spawn All Four Retrieval Agents in Parallel

### Step 1a — Read all four task files first

Before spawning any agents, read all four task files so their full contents are in context:

```
/home/prometheus/innovius-brief/agents/retrieval-slack-channels.md
/home/prometheus/innovius-brief/agents/retrieval-slack-search.md
/home/prometheus/innovius-brief/agents/retrieval-gmail.md
/home/prometheus/innovius-brief/agents/retrieval-granola.md
/home/prometheus/innovius-brief/agents/retrieval-cloudzero.md
```

### Step 1b — Spawn all four agents in ONE message — no exceptions

Before spawning, post to Slack:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"🔄 Step 1 — Retrievers starting (parallel)...\"}"
```

🛑 STOP. Read this before doing anything else.

You MUST emit all four Agent tool calls in a single response — meaning one message that contains four tool_use blocks. This is not optional. Sequential spawning defeats the purpose of the pipeline and will cause the brief to time out.

❌ WRONG — do NOT do this:
- Send Agent tool call for Slack Channel Retriever. Wait. Receive result.
- Send Agent tool call for Slack DM Retriever. Wait. Receive result.
- (etc.)

✅ CORRECT — do exactly this:
- Send ONE message containing all five Agent tool calls simultaneously:
  - tool_use: Agent → Slack Channel Retriever
  - tool_use: Agent → Slack DM Retriever
  - tool_use: Agent → Gmail Retriever
  - tool_use: Agent → Granola Retriever
  - tool_use: Agent → CloudZero Retriever
- Then wait. All five run concurrently. All five return before you proceed.

If you issued these as separate messages or waited for any agent before launching the next — stop and start Step 1b over.

---

For each agent, the `prompt` parameter must be the **full text content** of the task file (read in Step 1a) — not the file path. Pass the current values of the relevant env vars **and the RUN_ID** inline in the prompt as a header block, e.g.:

```
SLACK_USER_TOKEN=<value>
SLACK_BOT_TOKEN=<value>
SLACK_TEAM_ID=<value>
RUN_ID=<value>

<full contents of retrieval-slack-channels.md>
```

**Slack Channel Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (SLACK_USER_TOKEN, SLACK_BOT_TOKEN, SLACK_TEAM_ID, RUN_ID) + full contents of retrieval-slack-channels.md

**Slack DM Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (SLACK_USER_TOKEN, SLACK_BOT_TOKEN, SLACK_TEAM_ID, RUN_ID) + full contents of retrieval-slack-search.md

**Gmail Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SLACK_BOT_TOKEN, RUN_ID) + full contents of retrieval-gmail.md

**Granola Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (GRANOLA_AUTH_TOKEN, PROMETHEUS_CHANNEL, SLACK_BOT_TOKEN, RUN_ID) + full contents of retrieval-granola.md

**CloudZero Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (SLACK_BOT_TOKEN, PROMETHEUS_CHANNEL, RUN_ID) + full contents of retrieval-cloudzero.md

All five must be in-flight at the same time. Each sub-agent inherits the MCP server configuration from this session (Slack, Gmail, Granola). Do not proceed to Step 2.5 until all five have returned.

---

## Step 2.5 — Retrieval Gate (Do Not Skip)

**First, verify the run files were written to disk:**
```bash
ls /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-slack-channels.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-slack-dms.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-gmail.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-granola.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-cloudzero.json 2>&1
```
Any file that is missing means that agent FAILED to write its output — treat that source as FAILED regardless of what the agent returned in-memory.

**Then verify the content of files that do exist:**

1. Each file must have `tool_calls_made > 0` — if any has `tool_calls_made: 0`, treat it as FAILED
   **Exceptions (graceful skips — do NOT treat as FAILED):**
   - Granola: `tool_calls_made: 0` AND (`no_meetings_found: true` OR `error` field present) → flag as "no meetings in last 24h"
   - CloudZero: `tool_calls_made: 0` AND `no_signals_found: true` → flag as "CloudZero files not pushed today — graceful skip"
2. Granola returning `total_signals: 0` with `no_meetings_found: true` is valid — flag as "no meetings in last 24h"
3. Gmail returning `total_signals: 0` is valid only if `broad_search_executed: true` is present. If missing or false, treat Gmail as FAILED.
4. **Signal quality check** — After marking sources as FAILED/ok, calculate:
   - `total_slack = slack_channels.total_signals + slack_dms.total_signals`
   - If `total_slack == 0` AND (`slack_channels.tool_calls_made > 0` OR `slack_dms.tool_calls_made > 0`): post a warning but do NOT abort:
   ```bash
   curl -s -X POST https://slack.com/api/chat.postMessage \
     -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"⚠️ Slack returned 0 signals despite tool calls — verify SLACK_USER_TOKEN in .env\"}"
   ```

If any source is FAILED: do NOT fabricate its data. Mark it as FAILED and proceed. The Synthesizer will note the gap.

**Baseline calibration** — query the 7-day rolling average and warn if any source dropped >50%:
```bash
python3 << 'PYEOF'
import sqlite3
db = "/home/prometheus/innovius-brief/memory/memory.db"
conn = sqlite3.connect(db)
n = conn.execute("SELECT COUNT(*) FROM run_quality WHERE date >= date('now','-7 days')").fetchone()[0]
if n >= 3:
    r = conn.execute("""SELECT AVG(slack_channels_signals), AVG(slack_search_signals),
        AVG(gmail_signals), AVG(granola_signals) FROM run_quality
        WHERE date >= date('now','-7 days')""").fetchone()
    avgs = [x or 0 for x in r]
    print(f"7d_avg (n={n}): slack_ch={avgs[0]:.1f} slack_dm={avgs[1]:.1f} gmail={avgs[2]:.1f} granola={avgs[3]:.1f}")
else:
    print(f"7d_avg: insufficient history ({n} runs) — skip calibration")
conn.close()
PYEOF
```
Compare today's signal counts from the retrieval files against the 7-day averages. If today's count for any source is < 50% of its average AND that source made tool calls, add a ⚠️ note to the Slack completion post below.

Post the retrieval summary to Slack (substitute actual counts and carry-over count from Step 0):
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"✅ Retrievers complete — Slack: SLACK_TOTAL signals · Gmail: GMAIL_TOTAL signals · Granola: GRANOLA_TOTAL signals · CARRY_OVERS_N carry-overs open\"}"
```
Replace SLACK_TOTAL with `slack_channels.total_signals + slack_dms.total_signals`, GMAIL_TOTAL with `gmail.total_signals`, GRANOLA_TOTAL with `granola.total_signals`, CARRY_OVERS_N with the `OPEN_CARRY_OVERS` value from Step 0.

---

## Step 3 — Synthesizer

Before spawning the Synthesizer, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"🔬 Synthesizer starting...\"}"
```

Spawn the Synthesizer sub-agent:

**Synthesizer**
- Model: claude-opus-4-6
- Task file: /home/prometheus/innovius-brief/agents/synthesizer.md
- Pass: RUN_ID, OPEN_CARRY_OVERS, and OLDEST_CARRY_OVER_DAYS from Step 0

Prompt header:
```
RUN_ID=<value>
OPEN_CARRY_OVERS=<value from Step 0>
OLDEST_CARRY_OVER_DAYS=<value from Step 0>

<full contents of synthesizer.md>
```

Wait for the Synthesizer to return the draft brief.

After the Synthesizer returns, run (substituting actual counts):
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"✅ Synthesizer complete — HOT_SIGNALS hot signals, HOT_ACTIONS hot actions\"}"
```

---

## Step 4 — Cross-Validator

Before spawning the Validator, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"🔍 Validator starting...\"}"
```

Spawn the Validator sub-agent:

**Validator**
- Model: claude-sonnet-4-6
- Task file: /home/prometheus/innovius-brief/agents/validator.md
- Pass: RUN_ID only — Validator reads all files from disk

Prompt header:
```
RUN_ID=<value>

<full contents of validator.md>
```

Wait for the Validator to complete. The validated brief is written to `memory/runs/{RUN_ID}-brief-final.json`.

After the Validator returns, run (substituting actual counts):
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"✅ Validator complete — KEPT kept, DROPPED dropped, REWRITTEN rewritten\"}"
```

---

## Step 4.5 — Write to Memory Database

Run this script to persist run data. Substitute the actual RUN_ID:

```bash
python3 << 'PYEOF'
import sqlite3, json, re, datetime

RUN_ID = "SUBSTITUTE_RUN_ID_HERE"
if RUN_ID == "SUBSTITUTE_RUN_ID_HERE":
    with open("/home/prometheus/innovius-brief/memory/last-run-id.txt") as f:
        RUN_ID = f.read().strip()

base = "/home/prometheus/innovius-brief/memory/runs"
db_path = "/home/prometheus/innovius-brief/memory/memory.db"
today = datetime.date.today().isoformat()
now = datetime.datetime.utcnow().isoformat() + "Z"
dow = datetime.date.today().strftime('%A')

ZERO = {"tool_calls_made": 0, "total_signals": 0, "signals": []}
def load_or_zero(p):
    try:
        with open(p) as f: return json.load(f)
    except FileNotFoundError: return ZERO

try:
    with open(f"{base}/{RUN_ID}-brief-final.json") as f: final = json.load(f)
except FileNotFoundError:
    print("WARNING: brief-final.json missing — skipping memory write")
    exit(0)

ch = load_or_zero(f"{base}/{RUN_ID}-slack-channels.json")
dm = load_or_zero(f"{base}/{RUN_ID}-slack-dms.json")
gm = load_or_zero(f"{base}/{RUN_ID}-gmail.json")
gr = load_or_zero(f"{base}/{RUN_ID}-granola.json")
cz = load_or_zero(f"{base}/{RUN_ID}-cloudzero.json")

brief = final["brief_text"]
vm = final.get("validator_metrics", {})

# Parse hot signals count from brief text (just for runs table — no DB rows needed for signals)
hs_match = re.search(r'## Hot Signals[^\n]*\n(.*?)(?=\n##|\n---|\Z)', brief, re.DOTALL | re.IGNORECASE)
hot_signals_count = sum(1 for l in (hs_match.group(1).split('\n') if hs_match else []) if l.strip().startswith('- '))
hot_actions_count = len(final.get("hot_actions", []))

conn = sqlite3.connect(db_path)
c = conn.cursor()

# ── Idempotency guard — skip if already written today ─
existing = c.execute("SELECT id FROM runs WHERE date = ?", (today,)).fetchone()
if existing:
    print(f"WARNING: run already recorded for {today} (id={existing[0]}) — skipping to prevent duplicates")
    conn.close()
    exit(0)

# ── 1. runs table ────────────────────────────────────
c.execute("""INSERT INTO runs (date, run_at, hot_signals, hot_actions, claims_kept,
  claims_dropped, claims_rewritten, mapping_corrections, mapping_ambiguities, companies_covered)
  VALUES (?,?,?,?,?,?,?,?,?,?)""",
  (today, now, hot_signals_count, hot_actions_count,
   vm.get("claims_kept", 0), vm.get("dropped", 0), vm.get("rewritten", 0),
   vm.get("mapping_corrections", 0), vm.get("mapping_ambiguities", 0), 7))
run_db_id = c.lastrowid

# NOTE: actions table writes (INSERT/UPDATE/dedup/resolve) are handled by
# the Action Assessor agent in Step 4.6 — not here.

COMPANIES = ["Sewer AI","Auditoria","CloudZero","Delightree","X-Cures","ClearML","RightRev"]

# ── 2. events table — all signals ────────────────────
events_written = 0
for src, file_data in [("slack_channels", ch), ("slack_dms", dm), ("gmail", gm), ("granola", gr), ("cloudzero", cz)]:
    for sig in file_data.get("signals", []):
        c.execute("INSERT INTO events (date, company, event_type, content, source, urgency, run_id) VALUES (?,?,?,?,?,?,?)",
                  (today, sig.get("company","Unknown"), sig.get("signal_type","account_context"),
                   sig.get("signal",""), src, sig.get("urgency","medium"), run_db_id))
        events_written += 1

# ── 5. company_state UPSERT ───────────────────────────
for co in COMPANIES:
    pattern = rf'### {re.escape(co)}[^\n]*\n(.*?)(?=\n---|\n### |\Z)'
    m = re.search(pattern, brief, re.DOTALL | re.IGNORECASE)
    if not m: continue
    block = m.group(1)
    eng = re.search(r'Engagement: (.+)', block)
    lt  = re.search(r'Last touch: (.+)', block)
    contacts = re.search(r'Active contacts: (.+)', block)
    c.execute("""INSERT OR REPLACE INTO company_state
      (company, engagement, last_touch_date, last_touch_channel, team_visibility, updated_at)
      VALUES (?,?,?,?,?,?)""",
      (co, eng.group(1).strip() if eng else None, today,
       lt.group(1).strip() if lt else None,
       contacts.group(1).strip() if contacts else None, now))

# ── 6. run_quality table ──────────────────────────────
c.execute("""INSERT INTO run_quality (date, day_of_week,
  slack_channels_calls, slack_channels_signals,
  slack_search_calls, slack_search_signals,
  gmail_calls, gmail_signals, granola_calls, granola_signals,
  cloudzero_calls, cloudzero_signals, cloudzero_status,
  hot_signals, hot_actions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
  (today, dow, ch["tool_calls_made"], ch["total_signals"],
   dm["tool_calls_made"], dm["total_signals"],
   gm["tool_calls_made"], gm["total_signals"],
   gr["tool_calls_made"], gr["total_signals"],
   cz["tool_calls_made"], cz["total_signals"],
   "ok" if cz["total_signals"] > 0 else ("skip" if cz.get("no_signals_found") else "ok"),
   hot_signals_count, hot_actions_count))

conn.commit()
conn.close()
print(f"Memory written: run_db_id={run_db_id}, events={events_written}")
PYEOF
```

If the script fails, log the error and continue — do not abort.

---

## Step 4.6 — Action Assessor

Post to Slack:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"🗂️ Action Assessor running...\"}"
```

Spawn the Action Assessor sub-agent:

**Action Assessor**
- Model: claude-sonnet-4-6
- Task file: /home/prometheus/innovius-brief/agents/action-assessor.md
- Pass: RUN_ID only — Action Assessor reads brief-final.json and queries DB itself

Prompt header:
```
RUN_ID=<value>

<full contents of action-assessor.md>
```

Wait for the Action Assessor to complete. It writes directly to `memory/memory.db` — no output files.

After it returns, post its summary to Slack (extract from the agent's stdout the `=== ACTION ASSESSOR COMPLETE ===` block).

---

## Step 5 — Write brief-data.js

Before writing dashboard, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"📊 Writing dashboard...\"}"
```

Run this script to build and write the dashboard entry. It reads everything from disk — do NOT cat brief-final.json or brief-data.js into context first. Substitute the actual RUN_ID value in the first line:

```bash
python3 << 'PYEOF'
import json, re, datetime

RUN_ID = "SUBSTITUTE_RUN_ID_HERE"
if RUN_ID == "SUBSTITUTE_RUN_ID_HERE":
    with open("/home/prometheus/innovius-brief/memory/last-run-id.txt") as f:
        RUN_ID = f.read().strip()
    print(f"WARNING: RUN_ID not substituted — read from last-run-id.txt: {RUN_ID}")

base = "/home/prometheus/innovius-brief/memory/runs"
dash = "/home/prometheus/innovius-brief/dashboard/brief-data.js"

# Load run files — fall back to brief-draft if brief-final missing
_using_draft = False
try:
    with open(f"{base}/{RUN_ID}-brief-final.json") as f: final = json.load(f)
except FileNotFoundError:
    with open(f"{base}/{RUN_ID}-brief-draft.json") as f: final = json.load(f)
    _using_draft = True
    print("WARNING: brief-final.json missing — falling back to draft")

ZERO = {"tool_calls_made": 0, "total_signals": 0, "signals": []}

def load_or_zero(path):
    try:
        with open(path) as f: return json.load(f)
    except FileNotFoundError:
        print(f"WARNING: {path} missing — using zero-signal placeholder")
        return ZERO

ch = load_or_zero(f"{base}/{RUN_ID}-slack-channels.json")
dm = load_or_zero(f"{base}/{RUN_ID}-slack-dms.json")
gm = load_or_zero(f"{base}/{RUN_ID}-gmail.json")
gr = load_or_zero(f"{base}/{RUN_ID}-granola.json")
cz = load_or_zero(f"{base}/{RUN_ID}-cloudzero.json")

brief = final["brief_text"]
vm = final.get("validator_metrics", {})

hs_match = re.search(r'## Hot Signals[^\n]*\n(.*?)(?=\n##|\n---|\Z)', brief, re.DOTALL | re.IGNORECASE)
hot_signals = []
if hs_match:
    for line in hs_match.group(1).split('\n'):
        line = line.strip()
        if line.startswith('- '): hot_signals.append(line[2:])

ha_match = re.search(r'## Hot Actions[^\n]*\n(.*?)(?=\n##|\n---|\Z)', brief, re.DOTALL | re.IGNORECASE)
hot_actions = []
if ha_match:
    for line in ha_match.group(1).split('\n'):
        line = line.strip()
        if line.startswith('- '): hot_actions.append(line[2:])

companies = ["Sewer AI", "Auditoria", "CloudZero", "Delightree", "X-Cures", "ClearML", "RightRev", "Innovius"]
company_data = {}
for co in companies:
    pattern = rf'### {re.escape(co)}[^\n]*\n(.*?)(?=\n---|\n### |\Z)'
    m = re.search(pattern, brief, re.DOTALL | re.IGNORECASE)
    if not m:
        company_data[co] = {"engagement":"Unknown","lastTouch":"","teamVisibility":"","hasSignal":False,"know":[],"action":[]}
        continue
    block = m.group(1)
    engagement = re.search(r'Engagement: (.+)', block)
    last_touch = re.search(r'Last touch: (.+)', block)
    contacts = re.search(r'Active contacts: (.+)', block)
    know_match = re.search(r'Know:\n(.*?)(?=\nAction:|\Z)', block, re.DOTALL)
    action_match = re.search(r'Action:\n(.*?)$', block, re.DOTALL)
    know_items = [l.strip()[2:] for l in (know_match.group(1) if know_match else "").split('\n') if l.strip().startswith('- ')]
    action_items = [l.strip()[2:] for l in (action_match.group(1) if action_match else "").split('\n') if l.strip().startswith('- ') and '[PROMOTED TO HOT' not in l]
    company_data[co] = {
        "engagement": engagement.group(1).strip() if engagement else "Unknown",
        "lastTouch": last_touch.group(1).strip() if last_touch else "",
        "teamVisibility": contacts.group(1).strip() if contacts else "",
        "hasSignal": len(know_items) > 0 or len(action_items) > 0,
        "know": know_items, "action": []
    }

try:
    import sqlite3 as _sq
    _conn = _sq.connect("/home/prometheus/innovius-brief/memory/memory.db")
    _rows = _conn.execute("SELECT CAST(julianday('now') - julianday(date_created) AS INTEGER) FROM actions WHERE checked=0").fetchall()
    carry_overs_open = len(_rows)
    oldest_carry_over_days = max((r[0] for r in _rows), default=0)
    _conn.close()
except Exception:
    carry_overs_open = 0
    oldest_carry_over_days = 0

now = datetime.datetime.utcnow()
new_entry = {
    "_date": now.strftime("%-B %-d, %Y"),
    "_dateKey": now.strftime("%Y-%m-%d"),
    "_metrics": {
        "slackMsgs": ch["total_signals"] + dm["total_signals"],
        "slackChannelSignals": ch["total_signals"],
        "slackDmSignals": dm["total_signals"],
        "emails": gm["total_signals"],
        "granolaMeetings": gr["total_signals"],
        "cloudzeroSignals": cz["total_signals"],
        "totalRetrieved": ch["total_signals"] + dm["total_signals"] + gm["total_signals"] + gr["total_signals"] + cz["total_signals"],
        "sourcesCited": vm.get("claims_kept", 0), "coverage": "7/7",
        "claimsKept": vm.get("claims_kept", 0), "dropped": vm.get("dropped", 0), "rewritten": vm.get("rewritten", 0),
        "hotSignals": len(hot_signals), "hotActions": len(hot_actions),
        "mappingCorrections": vm.get("mapping_corrections", 0),
        "mappingAmbiguities": vm.get("mapping_ambiguities", 0),
        "sourceTagsAdded": vm.get("source_tags_added", 0),
        "hotActionsReordered": "yes" if vm.get("hot_actions_reordered") else "no",
        "falseNegativesRecovered": vm.get("false_negatives_recovered", 0),
        "toolCallsA1": ch["tool_calls_made"], "toolCallsA2": dm["tool_calls_made"],
        "toolCallsB": gm["tool_calls_made"], "toolCallsC": gr["tool_calls_made"],
        "toolCallsD": cz["tool_calls_made"],
        "carryOversOpen": carry_overs_open,
        "oldestCarryOverDays": oldest_carry_over_days
    },
    "_hotSignals": hot_signals, "_hotActions": hot_actions,
}
for co, data in company_data.items():
    new_entry[co] = data

# Read existing history — strip the JS wrapper to get pure JSON
try:
    raw = open(dash).read().strip()
    json_str = raw.removeprefix("const BRIEF_DATA = ").removesuffix(";")
    history = json.loads(json_str).get("_history", [])
except Exception:
    history = []
history = [new_entry] + history
history = history[:7]

output = "const BRIEF_DATA = " + json.dumps({"_history": history}, indent=2) + ";\n"
import tempfile as _tf, os as _os2
_dir = _os2.path.dirname(_os2.path.abspath(dash))
with _tf.NamedTemporaryFile("w", dir=_dir, delete=False, suffix=".tmp") as _tmp:
    _tmp.write(output)
    _tmp_path = _tmp.name
_os2.replace(_tmp_path, dash)
print(f"Written OK. History entries: {len(history)}. Dates: {[e['_dateKey'] for e in history]}")
PYEOF
```

If the script exits with an error, log it and continue — do not abort the run.

---

After writing brief-data.js, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"✅ Dashboard updated. Preparing summary...\"}"
```

If the Python block above printed `WARNING: brief-final.json missing`, also run this alert:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"⚠️ *Validator failed* — dashboard is showing *DRAFT* content, not validated output. The validator did not complete this run. Check run.log.\"}"
```

## Step 6 — Print Run Summary

Print only this block — do NOT print the full brief:

```
✅ Brief run complete — [date]

Sources
  Slack channels:      [tool_calls_made] calls · [total_signals] signals
  Slack DMs:           [tool_calls_made] calls · [total_signals] signals
  Gmail:               [tool_calls_made] calls · [total_signals] signals
  Granola:             [tool_calls_made] calls · [total_signals] signals
  Total retrieved: [sum] · Companies covered: [N]/7

Validator
  Kept: [N] · Dropped: [N] · Rewritten: [N]
  Hot Signals: [N] · Hot Actions: [N]
  Mapping corrections: [N] | Mapping ambiguities flagged: [N]

Tokens (session total)
  Channels Haiku:    ~[N] in · ~[N] out
  DMs Haiku:         ~[N] in · ~[N] out
  Gmail Haiku:       ~[N] in · ~[N] out
  Granola Haiku:     ~[N] in · ~[N] out
  Synthesizer Opus:  ~[N] in · ~[N] out
  Validator Sonnet:  ~[N] in · ~[N] out
  Orchestrator:      ~[N] in · ~[N] out
  (Exact session totals appended by run-brief.sh)

Failed sources: [none | list]
brief-data.js: ✅ written
```

Note: Token counts above are best-effort estimates from sub-agent reports. Exact session totals (input, output, cost) are parsed from `--output-format json` and appended to the log by run-brief.sh after this block.

## Step 7 — Pipeline Health Check

Run this after the Action Assessor completes. It verifies semantic_importance was set and checks for duplicate actions, then posts results to Slack:

```bash
python3 << 'PYEOF'
import sqlite3, json, urllib.request, os

db = "/home/prometheus/innovius-brief/memory/memory.db"
conn = sqlite3.connect(db)

today = __import__('datetime').date.today().isoformat()

# Test 1: Action Assessor — semantic_importance on new actions
new_actions = conn.execute(
    "SELECT id, company, semantic_importance FROM actions WHERE checked=0 AND date_created=?",
    (today,)
).fetchall()
total_new = len(new_actions)
important = sum(1 for r in new_actions if r[2])

# Test 2: Duplicate detection
dupes = conn.execute("""
    SELECT company, substr(content,1,60) as snippet, COUNT(*) as n
    FROM actions WHERE checked=0
    GROUP BY company, substr(content,1,60)
    HAVING n > 1
""").fetchall()
conn.close()

# Build message
lines = ["*Pipeline Health Check*"]

if total_new == 0:
    lines.append("ℹ️ Action Assessor: no new actions created today")
elif important > 0:
    lines.append(f"✅ Action Assessor: {total_new} new actions · {important} marked semantic_importance=1")
else:
    lines.append(f"⚠️ Action Assessor: {total_new} new actions · 0 marked semantic_importance=1 — assessor may not have run")

if not dupes:
    lines.append("✅ Duplicate check: no duplicate actions found")
else:
    lines.append(f"⚠️ Duplicates detected ({len(dupes)} groups):")
    for co, snippet, n in dupes:
        lines.append(f"  [{co}] {snippet}... ({n} copies)")

msg = "\n".join(lines)
data = json.dumps({"channel": os.environ["PROMETHEUS_CHANNEL"], "text": msg}).encode()
req = urllib.request.Request(
    "https://slack.com/api/chat.postMessage", data=data,
    headers={"Authorization": "Bearer " + os.environ["SLACK_BOT_TOKEN"], "Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as r:
    print(r.read().decode())
print(msg)
PYEOF
```

## Step 8 — Clean Up Old Run Files

Delete run files older than 7 days to prevent unbounded growth:
```bash
find /home/prometheus/innovius-brief/memory/runs/ -name "*.json" -mtime +7 -delete
```

---

## Model Reference
| Agent        | Model                        | Reason                          |
|-------------|------------------------------|---------------------------------|
| Slack Channel Retriever, Slack DM Retriever, Gmail, Granola | claude-haiku-4-5-20251001 | Mechanical retrieval, low cost |
| Synthesizer  | claude-opus-4-6              | Multi-source synthesis + longitudinal reasoning |
| Validator    | claude-sonnet-4-6            | Rules-based verification + source tracing       |
| Orchestrator | claude-sonnet-4-6            | Coordination logic              |
