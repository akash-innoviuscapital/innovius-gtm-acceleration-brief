# Innovius Capital — GTM Acceleration Intelligence System

A daily portfolio intelligence pipeline built on Claude Code. Every weekday morning it pulls signals from Slack, Gmail, and Granola meeting notes across 7 portfolio companies, synthesizes them into a prioritized brief, validates the output, and posts it to a live dashboard.

---

## What It Does

The pipeline runs at 9:11 AM ET every weekday via cron. In ~10–20 minutes it:

1. **Retrieves signals** from Slack channels, Slack DMs, Gmail, and Granola meetings in parallel
2. **Synthesizes** a brief with Hot Signals (board-visible / LP-visible threats) and Hot Actions (things Akash is the direct blocker on)
3. **Validates** every claim — person-company mapping, source attribution, urgency calibration
4. **Assesses actions** — scores open action items for urgency, carries forward unchecked items
5. **Posts a summary** to a private Slack channel and updates the dashboard
6. **Self-heals** via a run monitor that detects and patches incomplete pipeline output

---

## Architecture

```
cron (9:11 AM ET)
    └── run-brief.sh
            ├── Pre-flight check (Haiku — fast MCP health check)
            └── Main pipeline (Sonnet — orchestrates everything)
                    ├── [parallel] Slack Channel Retriever     → slack-channels.json
                    ├── [parallel] Slack DM/Search Retriever   → slack-dms.json
                    ├── [parallel] Gmail Retriever             → gmail.json
                    ├── [parallel] Granola Meeting Retriever   → granola.json
                    ├── [parallel] CloudZero Data Retriever    → cloudzero.json
                    ├── Synthesizer  (drafts the brief)
                    ├── Validator    (scrubs claims, fixes mappings)
                    ├── Action Assessor  (writes all DB action rows)
                    └── Run Monitor  (self-healing, last agent)
```

All agents are plain Markdown files in `agents/`. The orchestrator (`tasks/daily-brief.md`) reads them and spawns them as sub-agents. No framework — just Claude Code's native `--dangerously-skip-permissions` headless mode and MCP tool access.

---

## Memory Architecture

The system maintains two layers of memory:

### 1. SQLite Database (`memory/memory.db`)
Persists structured state across runs:

| Table | Purpose |
|---|---|
| `runs` | One row per pipeline execution — signal counts, source health, carry-over stats |
| `events` | Longitudinal intelligence log — every signal per company per day |
| `actions` | Checklist / carry-overs — open items surface in every subsequent brief |
| `company_state` | Last-known engagement status per company — seeded into each Synthesizer prompt |
| `run_quality` | Source health metrics — powers weekly health reporting |

### 2. Company Context Cards (`memory/companies/`)
Interpretive judgment files — one per portfolio company:

- `{company}.md` — Current interpretive context: what the synthesizer should weigh, what signals to elevate or deprioritize, known dynamics and risks
- `{company}-history.md` — Dated weekly memory entries: who said what, what actions were completed, what changed

These are written by humans (and `company-memory-agent.py`) and read by the Synthesizer and Validator on every run. They are the "institutional memory" layer — not raw data, but judgment.

---

## File Structure

```
innovius-brief/
├── CLAUDE.md                        ← Auto-loaded system identity, person-company roster
├── run-brief.sh                     ← Cron entrypoint
├── run-smoke-test.sh                ← 6-hour retriever health check
├── slack-bot.py                     ← Slack bot server (listens for commands)
├── compact-mem.py                   ← Cross-session memory compaction
├── company-memory-agent.py          ← Weekly per-company memory synthesis (cron: Sunday 5 AM)
│
├── agents/
│   ├── retrieval-slack-channels.md  ← Reads portfolio Slack channels
│   ├── retrieval-slack-search.md    ← Searches DMs and cross-channel
│   ├── retrieval-gmail.md           ← Reads Gmail for portfolio signals
│   ├── retrieval-granola.md         ← Reads Granola meeting transcripts
│   ├── retrieval-cloudzero.md       ← Reads CloudZero-specific data sources
│   ├── synthesizer.md               ← Drafts the brief from retriever output
│   ├── validator.md                 ← Cross-validates claims and mappings
│   ├── action-assessor.md           ← Owns all DB writes for actions table
│   ├── run-monitor.md               ← Detects incomplete runs, self-heals
│   └── slack-bot.md                 ← Slack bot agent prompt
│
├── tasks/
│   ├── daily-brief.md               ← Master orchestrator task
│   ├── smoke-test.md                ← Retriever health check task
│   └── pre-flight.md                ← Pre-run MCP connectivity check
│
├── memory/
│   ├── schema.sql                   ← SQLite schema (auto-applied each run)
│   └── companies/                   ← Company context cards (8 companies × 2 files)
│
└── dashboard/
    ├── index.html                   ← Brief dashboard UI
    ├── brief-data.js                ← Latest pipeline output
    ├── server.py                    ← Python HTTP server (systemd / Cloudflare Tunnel)
    └── architecture.html            ← Interactive pipeline diagram
```

---

## Setup

### Prerequisites

- **Claude Code CLI** installed and authenticated (`claude` in PATH)
- **Python 3** with `sqlite3` (stdlib — no pip installs needed)
- **MCP servers** configured in your Claude Code settings:
  - `slack` — Slack MCP (bot token + user token)
  - `gmail` — Gmail MCP (OAuth)
  - `granola` — Granola MCP
- A Linux server with cron access (the pipeline runs headless)

### 1. Clone and configure

```bash
git clone https://github.com/akash-innoviuscapital/innovius-gtm-acceleration-brief.git
cd innovius-gtm-acceleration-brief
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
SLACK_BOT_TOKEN=xoxb-...          # Bot token (chat:write, channels:history, etc.)
SLACK_USER_TOKEN=xoxp-...         # User token (search:read)
SLACK_TEAM_ID=T...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GRANOLA_MCP_URL=https://mcp.granola.ai/mcp
GRANOLA_AUTH_TOKEN=...
```

### 2. Initialize the database

```bash
sqlite3 memory/memory.db < memory/schema.sql
```

### 3. Configure MCP servers

Add Slack, Gmail, and Granola to your Claude Code MCP config (`~/.claude/settings.json` or via `claude mcp add`). The pipeline calls these via `claude --dangerously-skip-permissions` so MCP servers must be configured at the user level.

### 4. Set up the cron job

```bash
crontab -e
```

Add:

```cron
11 14 * * 1-5 /home/prometheus/innovius-brief/run-brief.sh
# ^ 9:11 AM ET = 14:11 UTC (adjust for your timezone)
```

### 5. Start the dashboard server

```bash
python3 dashboard/server.py
```

The dashboard runs on port 8080 by default. Expose it via Cloudflare Tunnel or nginx as needed.

---

## Dashboard

The brief dashboard at `dashboard/index.html` shows:

- **Hot Signals** — board/LP-visible threats, flagged in real time
- **Hot Actions** — open items with carry-over age
- **Per-company panes** — all 7 companies, collapsible, with company-specific actions
- **Completed actions toggle** — view what's been checked off
- Checkbox state persists to the database — carry-overs surface automatically in the next run

---

## Weekly Memory Agent

`company-memory-agent.py` runs every Sunday at 5 AM via cron. It reads the past week's pipeline runs and writes a structured weekly memory entry to each company's `memory/companies/{company}-history.md`. This keeps the Synthesizer's interpretive context fresh without manual updates.

---

## Key Design Decisions

- **No framework** — agents are Markdown files, orchestration is a bash script calling `claude -p`. Simple to debug, easy to modify individual agents.
- **Runs are stateless, memory is not** — each pipeline run starts fresh (`FRESH INVOCATION OVERRIDE`) but reads carry-overs and company state from SQLite before generating output.
- **Validator owns integrity** — person-company mapping errors, unattributed claims, and urgency miscalibration are caught by a dedicated validation pass, not baked into the synthesizer prompt.
- **Action Assessor owns DB writes** — one agent owns all `INSERT`/`UPDATE` to the actions table. This prevents duplicate rows from parallel writes.
- **Self-healing** — the Run Monitor checks for missing companies, missing actions table writes, and incomplete output after every run, and patches via targeted re-runs.
