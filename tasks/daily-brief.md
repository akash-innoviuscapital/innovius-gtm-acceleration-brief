# Daily Portfolio Intelligence Brief — Orchestrator

## Overview
This is the master task file for the Innovius Capital daily portfolio intelligence brief. It runs every morning at 9:11 AM ET via cron. It spawns four retrieval sub-agents in parallel, passes their output to a Synthesizer, then a Validator, writes the final brief to disk, and prints a run summary.

All context about Akash, Innovius, portfolio companies, and the canonical person-company roster is in CLAUDE.md — loaded automatically at session start.

---

## Step 0 — Confirm Environment
Verify the following environment variables are loaded from .env:
- SLACK_USER_TOKEN
- SLACK_TEAM_ID
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GRANOLA_MCP_URL

If any are missing, abort and log the error to /home/prometheus/innovius-brief/memory/error.log.

Generate a RUN_ID for this run and create the runs directory:
```bash
RUN_ID=$(date +%Y%m%d-%H%M)
mkdir -p /home/prometheus/innovius-brief/memory/runs/
echo "$RUN_ID" > /home/prometheus/innovius-brief/memory/last-run-id.txt
echo "RUN_ID: $RUN_ID"
```
Store the RUN_ID value — you will pass it to every retrieval agent, the Synthesizer, and the Validator.

---

## Step 1 — Spawn All Four Retrieval Agents in Parallel

### Step 1a — Read all four task files first

Before spawning any agents, read all four task files so their full contents are in context:

```
/home/prometheus/innovius-brief/agents/retrieval-slack-channels.md
/home/prometheus/innovius-brief/agents/retrieval-slack-search.md
/home/prometheus/innovius-brief/agents/retrieval-gmail.md
/home/prometheus/innovius-brief/agents/retrieval-granola.md
```

### Step 1b — Spawn all four agents in ONE message — no exceptions

🛑 STOP. Read this before doing anything else.

You MUST emit all four Agent tool calls in a single response — meaning one message that contains four tool_use blocks. This is not optional. Sequential spawning defeats the purpose of the pipeline and will cause the brief to time out.

❌ WRONG — do NOT do this:
- Send Agent tool call for Slack Channel Retriever. Wait. Receive result.
- Send Agent tool call for Slack DM Retriever. Wait. Receive result.
- (etc.)

✅ CORRECT — do exactly this:
- Send ONE message containing all four Agent tool calls simultaneously:
  - tool_use: Agent → Slack Channel Retriever
  - tool_use: Agent → Slack DM Retriever
  - tool_use: Agent → B  (Gmail)
  - tool_use: Agent → C  (Granola)
- Then wait. All four run concurrently. All four return before you proceed.

If you issued these as separate messages or waited for any agent before launching the next — stop and start Step 1b over.

---

For each agent, the `prompt` parameter must be the **full text content** of the task file (read in Step 1a) — not the file path. Pass the current values of the relevant env vars **and the RUN_ID** inline in the prompt as a header block, e.g.:

```
SLACK_USER_TOKEN=<value>
SLACK_TEAM_ID=<value>
RUN_ID=<value>

<full contents of retrieval-slack-channels.md>
```

**Slack Channel Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (SLACK_USER_TOKEN, SLACK_TEAM_ID, RUN_ID) + full contents of retrieval-slack-channels.md

**Slack DM Retriever**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (SLACK_USER_TOKEN, SLACK_TEAM_ID, RUN_ID) + full contents of retrieval-slack-search.md

**Agent B — Gmail**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RUN_ID) + full contents of retrieval-gmail.md

**Agent C — Granola**
- Model: claude-haiku-4-5-20251001
- Prompt: env vars (GRANOLA_MCP_URL, RUN_ID) + full contents of retrieval-granola.md

All four must be in-flight at the same time. Each sub-agent inherits the MCP server configuration from this session (Slack, Gmail, Granola). Do not proceed to Step 2.5 until all four have returned.

---

## Step 2.5 — Retrieval Gate (Do Not Skip)

**First, verify the run files were written to disk:**
```bash
ls /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-slack-channels.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-slack-dms.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-gmail.json \
   /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-granola.json 2>&1
```
Any file that is missing means that agent FAILED to write its output — treat that source as FAILED regardless of what the agent returned in-memory.

**Then verify the content of files that do exist:**

1. Each file must have `tool_calls_made > 0` — if any has `tool_calls_made: 0`, treat it as FAILED
2. Granola returning `total_signals: 0` with `no_meetings_found: true` is valid — flag as "no meetings in last 24h"
3. Gmail returning `total_signals: 0` is valid only if `broad_search_executed: true` is present. If missing or false, treat Gmail as FAILED.

If any source is FAILED: do NOT fabricate its data. Mark it as FAILED and proceed. The Synthesizer will note the gap.

---

## Step 3 — Synthesizer

Before spawning the Synthesizer, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"C0AN3GW1SVC","text":"🔬 Synthesizer starting..."}'
```

Spawn the Synthesizer sub-agent:

**Synthesizer**
- Model: claude-sonnet-4-6
- Task file: /home/prometheus/innovius-brief/agents/synthesizer.md
- Pass: RUN_ID value only — the Synthesizer reads its own run files from disk

Prompt header:
```
RUN_ID=<value>

<full contents of synthesizer.md>
```

Wait for the Synthesizer to return the draft brief.

After the Synthesizer returns, run (substituting actual counts):
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"C0AN3GW1SVC\",\"text\":\"✅ Synthesizer complete — HOT_SIGNALS hot signals, HOT_ACTIONS hot actions\"}"
```

---

## Step 4 — Cross-Validator

Before spawning the Validator, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"C0AN3GW1SVC","text":"🔍 Validator starting..."}'
```

Spawn the Validator sub-agent:

**Validator**
- Model: claude-opus-4-6
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
  -d "{\"channel\":\"C0AN3GW1SVC\",\"text\":\"✅ Validator complete — KEPT kept, DROPPED dropped, REWRITTEN rewritten\"}"
```

---

## Step 5 — Write brief-data.js

Before writing dashboard, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"C0AN3GW1SVC","text":"📊 Writing dashboard..."}'
```

Read the validated brief and metrics from the run file:

```bash
cat /home/prometheus/innovius-brief/memory/runs/${RUN_ID}-brief-final.json
```

Extract `brief_text` (the final corrected brief) and `validator_metrics` from this file. If `brief-final.json` does not exist but `brief-draft.json` does, fall back to the draft and note validation was skipped.

Read the existing brief-data.js to get current history:

```bash
cat /home/prometheus/innovius-brief/dashboard/brief-data.js
```

Prepend today's entry as the first item in _history. Keep at most 7 entries. Populate _metrics from retrieval agent totals and validator_metrics from the run file. Write the updated file back to:

```
/home/prometheus/innovius-brief/dashboard/brief-data.js
```

---

After writing brief-data.js, run:
```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"C0AN3GW1SVC","text":"✅ Dashboard updated. Preparing summary..."}'
```

## Step 6 — Print Run Summary

Print only this block — do NOT print the full brief:

```
✅ Brief run complete — [date]

Sources
  Slack channels:      [tool_calls_made] calls · [total_signals] signals
  Slack DMs:           [tool_calls_made] calls · [total_signals] signals
  Gmail (B):           [tool_calls_made] calls · [total_signals] signals
  Granola (C):         [tool_calls_made] calls · [total_signals] signals
  Total retrieved: [sum] · Companies covered: [N]/7

Validator
  Kept: [N] · Dropped: [N] · Rewritten: [N]
  Hot Signals: [N] · Hot Actions: [N]
  Mapping corrections: [N] | Mapping ambiguities flagged: [N]

Tokens (session total)
  Channels Haiku:    ~[N] in · ~[N] out
  DMs Haiku:         ~[N] in · ~[N] out
  B  Haiku:          ~[N] in · ~[N] out
  C  Haiku:          ~[N] in · ~[N] out
  Synthesizer Sonnet:~[N] in · ~[N] out
  Validator Opus:    ~[N] in · ~[N] out
  Orchestrator:      ~[N] in · ~[N] out
  (Exact session totals appended by run-brief.sh)

Failed sources: [none | list]
brief-data.js: ✅ written
```

Note: Token counts above are best-effort estimates from sub-agent reports. Exact session totals (input, output, cost) are parsed from `--output-format json` and appended to the log by run-brief.sh after this block.

## Step 7 — Clean Up Old Run Files

Delete run files older than 7 days to prevent unbounded growth:
```bash
find /home/prometheus/innovius-brief/memory/runs/ -name "*.json" -mtime +7 -delete
```

---

## Model Reference
| Agent        | Model                        | Reason                          |
|-------------|------------------------------|---------------------------------|
| Slack Channel Retriever, Slack DM Retriever, Gmail, Granola | claude-haiku-4-5-20251001 | Mechanical retrieval, low cost |
| Synthesizer  | claude-sonnet-4-6            | Pattern recognition, writing    |
| Validator    | claude-opus-4-6              | Precision verification          |
| Orchestrator | claude-sonnet-4-6            | Coordination logic              |
