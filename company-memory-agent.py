#!/usr/bin/env python3
"""
Company memory agent — runs weekly (Sunday 5 AM).

For each portfolio company:
1. Queries events (last 7 days) + completed actions (last 7 days) from memory.db
2. Synthesizes a dated weekly history entry → prepends to {company}-history.md
3. Synthesizes a compact rolling memory section → replaces AUTO-MEMORY block in {company}.md

The AUTO-MEMORY section in each context card is read by the synthesizer + validator on every
pipeline run, giving the daily brief rolling longitudinal context without growing unboundedly.
The history file is never read automatically — available on demand for deep lookups.
"""

import sqlite3
import subprocess
import json
import tempfile
import os
from datetime import datetime, timedelta, date
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
DB_PATH = Path("/home/prometheus/innovius-brief/memory/memory.db")
COMPANIES_DIR = Path("/home/prometheus/innovius-brief/memory/companies")
LOG_FILE = Path("/home/prometheus/innovius-brief/memory/company-memory.log")
MIN_ROWS = 3  # skip company if fewer combined events + completed actions

COMPANIES = {
    'Auditoria':  'auditoria',
    'ClearML':    'clearml',
    'CloudZero':  'cloudzero',
    'Delightree': 'delightree',
    'Innovius':   'innovius',
    'RightRev':   'rightrev',
    'Sewer AI':   'sewer-ai',
    'X-Cures':    'xcures',
}

AUTO_MEMORY_START = "<!-- AUTO-MEMORY: updated weekly by company-memory-agent.py -->"
AUTO_MEMORY_END   = "<!-- END-AUTO-MEMORY -->"


def log(msg: str) -> None:
    ts = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with LOG_FILE.open("a") as f:
        f.write(line + "\n")


def call_claude(prompt: str) -> str:
    result = subprocess.run(
        [
            "claude",
            "--dangerously-skip-permissions",
            "--model", "claude-haiku-4-5-20251001",
            "--output-format", "json",
            "-p", prompt,
        ],
        capture_output=True,
        text=True,
        stdin=subprocess.DEVNULL,
    )
    if result.returncode != 0:
        raise RuntimeError(f"claude exited {result.returncode}: {result.stderr[:300]}")
    try:
        outer = json.loads(result.stdout)
        return outer.get("result", result.stdout) if isinstance(outer, dict) else result.stdout
    except json.JSONDecodeError:
        return result.stdout


def query_company_data(conn: sqlite3.Connection, company: str) -> dict:
    cutoff = (date.today() - timedelta(days=7)).isoformat()

    events = conn.execute(
        """SELECT date, event_type, content, urgency, source
           FROM events
           WHERE company=? AND date >= ?
           ORDER BY date DESC""",
        (company, cutoff),
    ).fetchall()

    actions = conn.execute(
        """SELECT content, date_created, date_completed
           FROM actions
           WHERE company=? AND checked=1 AND date_completed >= ?
           ORDER BY date_completed DESC""",
        (company, cutoff),
    ).fetchall()

    state = conn.execute(
        "SELECT engagement, last_touch_date, last_touch_channel, team_visibility FROM company_state WHERE company=?",
        (company,),
    ).fetchone()

    return {"events": events, "actions": actions, "state": state}


def format_data_for_prompt(company: str, data: dict) -> str:
    lines = [f"Company: {company}"]

    if data["state"]:
        e, lt, lc, tv = data["state"]
        lines.append(f"Current state: engagement={e}, last_touch={lt} via {lc}")
        if tv:
            lines.append(f"Team visibility: {tv}")

    if data["events"]:
        lines.append(f"\nSignals this week ({len(data['events'])} events):")
        for ev in data["events"]:
            d, etype, content, urgency, source = ev
            urg = f" [{urgency}]" if urgency else ""
            src = f" (via {source})" if source else ""
            lines.append(f"  [{d}] {etype}{urg}: {content[:200]}{src}")
    else:
        lines.append("\nSignals this week: none")

    if data["actions"]:
        lines.append(f"\nCompleted actions this week ({len(data['actions'])}):")
        for content, created, completed in data["actions"]:
            lines.append(f"  [completed {completed}] {content[:200]}")
    else:
        lines.append("\nCompleted actions this week: none")

    return "\n".join(lines)


def build_history_prompt(company: str, data_str: str, today: str, week_start: str) -> str:
    return f"""You are writing a weekly memory entry for {company} as part of an investment firm's portfolio intelligence system.

Today: {today}
Week of: {week_start}

DATA:
{data_str}

Write a dated weekly memory entry in EXACTLY this format (no preamble, start directly with the heading):

## {today} — Week of {week_start}
- [specific bullet about key events, signals, or developments — include names and topics]
- [specific bullet about completed actions and outcomes]
- [additional bullets as needed — max 6 total]

Rules:
- Be specific: include names, topics, specific outcomes
- No generic observations ("discussions continued", "progress made")
- Max 150 words total
- If minimal data, write fewer bullets rather than padding
- Do NOT add any preamble or closing remarks"""


def build_card_prompt(company: str, data_str: str, prior_memory: str) -> str:
    prior_section = prior_memory.strip() if prior_memory.strip() else "None — this is the first weekly synthesis."
    return f"""You are updating the rolling memory section of an interpretive context card for {company} in an investment firm's portfolio intelligence system.

This section is read daily by an AI synthesizer to provide longitudinal context. It must stay compact and useful.

PRIOR MEMORY SECTION (from previous weeks):
{prior_section}

THIS WEEK'S NEW DATA:
{data_str}

Write a compact rolling memory section (EXACTLY max 200 words) that:
1. Synthesizes what has happened across recent weeks (not just this week)
2. Identifies patterns, trajectories, or sustained themes
3. Preserves important historical context from prior weeks that is still relevant
4. Drops stale details that are no longer actionable or relevant
5. Names specific people, actions, and outcomes

Rules:
- This is a SYNTHESIS, not a log — no date headers, no "Week of X" formatting
- Write in present-tense summary style ("CRO search is ongoing", "Q1 missed by X")
- Be dense: every sentence must carry specific intelligence
- Hard limit: 200 words
- No preamble, no closing remarks — start directly with the content"""


def get_prior_auto_memory(card_text: str) -> str:
    if AUTO_MEMORY_START not in card_text:
        return ""
    start_idx = card_text.index(AUTO_MEMORY_START) + len(AUTO_MEMORY_START)
    if AUTO_MEMORY_END not in card_text:
        return card_text[start_idx:].strip()
    end_idx = card_text.index(AUTO_MEMORY_END)
    return card_text[start_idx:end_idx].strip()


def atomic_write(path: Path, content: str) -> None:
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(content)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def update_context_card(card_path: Path, new_memory: str) -> None:
    card_text = card_path.read_text()
    new_block = f"\n\n{AUTO_MEMORY_START}\n{new_memory.strip()}\n{AUTO_MEMORY_END}\n"

    if AUTO_MEMORY_START in card_text and AUTO_MEMORY_END in card_text:
        start_idx = card_text.index(AUTO_MEMORY_START)
        end_idx = card_text.index(AUTO_MEMORY_END) + len(AUTO_MEMORY_END)
        new_text = card_text[:start_idx].rstrip() + new_block
    else:
        new_text = card_text.rstrip() + new_block

    atomic_write(card_path, new_text)


def prepend_history_entry(history_path: Path, entry: str) -> None:
    existing = history_path.read_text() if history_path.exists() else ""
    separator = "\n\n---\n\n" if existing.strip() else "\n"
    new_text = entry.strip() + separator + existing
    atomic_write(history_path, new_text)


def process_company(conn: sqlite3.Connection, company: str, slug: str, today: str, week_start: str) -> None:
    data = query_company_data(conn, company)
    total_rows = len(data["events"]) + len(data["actions"])

    if total_rows < MIN_ROWS:
        log(f"  {company}: SKIP — {total_rows} row(s) below threshold ({MIN_ROWS})")
        return

    log(f"  {company}: {len(data['events'])} events + {len(data['actions'])} completed actions")
    data_str = format_data_for_prompt(company, data)

    card_path    = COMPANIES_DIR / f"{slug}.md"
    history_path = COMPANIES_DIR / f"{slug}-history.md"

    card_text    = card_path.read_text() if card_path.exists() else ""
    prior_memory = get_prior_auto_memory(card_text)

    log(f"  {company}: generating history entry (Haiku)...")
    history_entry = call_claude(build_history_prompt(company, data_str, today, week_start))

    log(f"  {company}: generating card memory section (Haiku)...")
    card_memory = call_claude(build_card_prompt(company, data_str, prior_memory))

    prepend_history_entry(history_path, history_entry)
    log(f"  {company}: prepended entry to {history_path.name}")

    if card_path.exists():
        update_context_card(card_path, card_memory)
        log(f"  {company}: updated AUTO-MEMORY in {card_path.name}")
    else:
        log(f"  {company}: WARNING — card file not found at {card_path}, history written but card skipped")


def main() -> None:
    today      = date.today().isoformat()
    today_dt   = date.today()
    week_start = (today_dt - timedelta(days=today_dt.weekday())).isoformat()

    log(f"=== Company memory agent starting — {today} (week of {week_start}) ===")

    conn = sqlite3.connect(str(DB_PATH))
    try:
        for company, slug in COMPANIES.items():
            try:
                process_company(conn, company, slug, today, week_start)
            except Exception as e:
                log(f"  {company}: ERROR — {e}")
    finally:
        conn.close()

    log("=== Company memory agent complete ===")


if __name__ == "__main__":
    main()
