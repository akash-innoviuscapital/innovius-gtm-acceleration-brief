# Daily Portfolio Intelligence Brief — Orchestrator

## Overview
This is the master task file for the Innovius Capital daily portfolio intelligence brief. It runs every morning at 9:11 AM PT via cron. It spawns four retrieval sub-agents in parallel, passes their output to a Synthesizer, then a Validator, writes the final brief to disk, and prints a run summary.

All context about Akash, Innovius, portfolio companies, and the canonical person-company roster is in CLAUDE.md — loaded automatically at session start.

---

## Step 0 — Confirm Environment
Verify the following environment variables are loaded from .env:
- SLACK_USER_TOKEN
- SLACK_TEAM_ID
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GRANOLA_MCP_URL

If any are missing, abort and log the error to /root/innovius-brief/memory/error.log.

---

## Step 1 — Load Carry-Overs from Memory

Read the carry-over state from SQLite:

```bash
sqlite3 /root/innovius-brief/memory/memory.db \
  "SELECT key, value, date FROM actions WHERE checked = 0 ORDER BY date ASC;"
sqlite3 /root/innovius-brief/memory/memory.db \
  "SELECT content, date, company FROM notes WHERE checked = 0 ORDER BY date ASC;"
```

Process both result sets:
- Unchecked actions (checked = 0) → carry into Hot Actions as [CARRY-OVER from {date}]
- Unchecked notes (checked = 0) → carry into the relevant company section as [NOTE {date}]

Track the date of each unchecked item. The oldest date feeds the run quality log.

---

## Step 2 — Spawn All Four Retrieval Agents in Parallel

⚠️ CRITICAL: Spawn all four agents in a SINGLE message simultaneously. Do NOT wait for one to return before launching the others. All four must be in-flight at the same time.

Spawn the following sub-agents in parallel:

**Agent A1 — Slack Guaranteed Channels**
- Model: claude-haiku-4-5-20251001
- Task file: /root/innovius-brief/agents/retrieval-slack-channels.md
- Pass: SLACK_USER_TOKEN, SLACK_TEAM_ID

**Agent A2 — Slack Workspace Search**
- Model: claude-haiku-4-5-20251001
- Task file: /root/innovius-brief/agents/retrieval-slack-search.md
- Pass: SLACK_USER_TOKEN, SLACK_TEAM_ID

**Agent B — Gmail**
- Model: claude-haiku-4-5-20251001
- Task file: /root/innovius-brief/agents/retrieval-gmail.md
- Pass: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

**Agent C — Granola**
- Model: claude-haiku-4-5-20251001
- Task file: /root/innovius-brief/agents/retrieval-granola.md
- Pass: GRANOLA_MCP_URL

Wait for all four to return before proceeding to Step 2.5.

---

## Step 2.5 — Retrieval Gate (Do Not Skip)

Before passing anything to the Synthesizer, verify:

1. All four JSON objects are present with source fields: slack_channels, slack_search, gmail, granola
2. Each has tool_calls_made > 0 — if any agent returned tool_calls_made: 0, treat its data as FAILED
3. Granola returning total_signals: 0 with no_meetings_found: true is valid — flag as "no meetings in last 24h"
4. Gmail returning total_signals: 0 is valid only if the agent confirms it ran the broad newer_than:2d search

If any agent FAILED: do NOT fabricate its data. Mark it as FAILED and proceed. The Synthesizer will note the gap.

---

## Step 3 — Synthesizer

Spawn the Synthesizer sub-agent:

**Synthesizer**
- Model: claude-sonnet-4-6
- Task file: /root/innovius-brief/agents/synthesizer.md
- Pass: All four retrieval agent JSON outputs + carry-over data from Step 1

Wait for the Synthesizer to return the draft brief before proceeding.

---

## Step 4 — Cross-Validator

Spawn the Validator sub-agent:

**Validator**
- Model: claude-opus-4-6
- Task file: /root/innovius-brief/agents/validator.md
- Pass: Synthesizer draft brief + source totals (total_signals from each of the 4 retrieval agents)

Wait for the Validator to return the final corrected brief before proceeding.

---

## Step 4.5 — Update Memory

Write today's run back to SQLite:

```bash
# Insert today's brief summary
sqlite3 /root/innovius-brief/memory/memory.db \
  "INSERT INTO runs (date, hot_signals, hot_actions, sources_status, carry_over_count)
   VALUES (date('now'), <N>, <N>, '<json>', <N>);"
```

Update run quality log:

```bash
node /root/innovius-brief/dashboard/new_entry.js
```

---

## Step 5 — Write brief-data.js

Read the existing brief-data.js to get current history:

```bash
cat /root/innovius-brief/dashboard/brief-data.js
```

Prepend today's entry as the first item in _history. Keep at most 7 entries. Populate _metrics from retrieval agent totals and validator output. Write the updated file back to:

```
/root/innovius-brief/dashboard/brief-data.js
```

---

## Step 6 — Print Run Summary

Print only this block — do NOT print the full brief:

```
✅ Brief run complete — [date]

Sources
  Slack channels (A1): [tool_calls_made] calls · [total_signals] signals
  Slack search (A2):   [tool_calls_made] calls · [total_signals] signals
  Gmail (B):           [tool_calls_made] calls · [total_signals] signals
  Granola (C):         [tool_calls_made] calls · [total_signals] signals
  Total retrieved: [sum] · Companies covered: [N]/7

Validator
  Kept: [N] · Dropped: [N] · Rewritten: [N]
  Hot Signals: [N] · Hot Actions: [N]
  Mapping corrections: [N] | Mapping ambiguities flagged: [N]

Carry-overs
  Actions: [N] · Notes: [N] · Total: [N] · Oldest: [N] days

Failed sources: [none | list]
brief-data.js: ✅ written
memory.db: ✅ updated
```

---

## Model Reference
| Agent        | Model                        | Reason                          |
|-------------|------------------------------|---------------------------------|
| A1, A2, B, C | claude-haiku-4-5-20251001   | Mechanical retrieval, low cost  |
| Synthesizer  | claude-sonnet-4-6            | Pattern recognition, writing    |
| Validator    | claude-opus-4-6              | Precision verification          |
| Orchestrator | claude-sonnet-4-6            | Coordination logic              |
