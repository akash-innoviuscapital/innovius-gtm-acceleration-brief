#!/usr/bin/env python3
"""
Memory compaction — runs weekly (Sunday 6 AM).

Summarizes claude-mem observations older than COMPACT_DAYS into a dense
weekly summary markdown file, then deletes those observations from the DB
to keep the 50-slot SessionStart injection window fresh.
"""

import sqlite3
import subprocess
import sys
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
COMPACT_DAYS = 7
MIN_OBS_TO_COMPACT = 5
CLAUDE_MEM_DB = Path.home() / ".claude-mem/claude-mem.db"
SUMMARIES_DIR = Path.home() / ".claude/projects/-home-prometheus/memory/weekly-summaries"
MEMORY_MD = Path.home() / ".claude/projects/-home-prometheus/memory/MEMORY.md"
LOG_FILE = Path.home() / "innovius-brief/memory/compact-mem.log"


def log(msg: str) -> None:
    ts = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a") as f:
        f.write(line + "\n")


def get_week_label() -> str:
    """Returns ISO week label like 2026-W13."""
    now = datetime.now()
    return f"{now.year}-W{now.strftime('%V')}"


def format_observation(row: tuple) -> str:
    id_, title, subtitle, type_, text, narrative, created_at = row
    date_str = created_at[:10]
    parts = [f"[{date_str}] [{type_.upper()}] {title}"]
    if subtitle:
        parts.append(f"  > {subtitle}")
    detail = narrative or text or ""
    if detail and len(detail) > 20:
        # Truncate very long details to keep prompt manageable
        detail = detail[:500].rstrip() + ("..." if len(detail) > 500 else "")
        parts.append(f"  Detail: {detail}")
    return "\n".join(parts)


def build_prompt(week: str, rows: list, date_range: tuple) -> str:
    start_date, end_date = date_range
    obs_text = "\n\n".join(format_observation(r) for r in rows)

    return f"""You are compacting memory observations from the Innovius brief pipeline — a daily AI-generated sales intelligence system for Innovius Capital (a B2B SaaS venture fund).

Week being compacted: {week}
Date range: {start_date} to {end_date}
Observations to compact: {len(rows)}

Your job: synthesize these observations into a dense weekly summary that preserves ALL decision-critical information while eliminating redundancy. Future sessions will read this instead of the individual observations.

OBSERVATIONS:
{obs_text}

Write the summary in EXACTLY this format (no preamble, start directly with the frontmatter):

---
week: {week}
date_range: {start_date} to {end_date}
observations_compacted: {len(rows)}
---

## Week {week} Memory Summary

### Key Decisions & Architecture Changes
- [Each significant decision, design choice, or confirmed fact — specific names/numbers/dates]

### Work Completed
- [Each feature built, bug fixed, config changed, file modified]

### Discoveries & Non-Obvious Findings
- [Things learned about the system, pipeline behavior, data patterns — NOT obvious from reading code]

### Active Risks & Open Issues
- [Problems identified, unresolved issues, things to watch]

Rules:
- Be DENSE. Every bullet must be specific and actionable.
- Preserve exact names, numbers, file paths, and dates.
- Eliminate anything derivable from reading the current code.
- Do NOT add any preamble or closing remarks outside the markdown format above."""


def call_claude(prompt: str) -> str:
    """Call claude -p with the prompt, return the text output."""
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
        log(f"ERROR: claude exited with code {result.returncode}")
        log(f"stderr: {result.stderr[:500]}")
        sys.exit(1)

    # Parse JSON wrapper to extract result text
    try:
        outer = json.loads(result.stdout)
        return outer.get("result", result.stdout) if isinstance(outer, dict) else result.stdout
    except json.JSONDecodeError:
        return result.stdout


def update_memory_md(week: str) -> None:
    """Add weekly summary entry to MEMORY.md if not already present."""
    content = MEMORY_MD.read_text()
    new_entry = f"- [{week}.md](weekly-summaries/{week}.md) — Compacted weekly summary"

    if new_entry in content:
        return  # already there

    if "## Weekly Summaries" not in content:
        content = content.rstrip() + f"\n\n## Weekly Summaries\n{new_entry}\n"
    else:
        content = content.replace(
            "## Weekly Summaries\n",
            f"## Weekly Summaries\n{new_entry}\n",
        )

    MEMORY_MD.write_text(content)
    log("Updated MEMORY.md with weekly summary entry")


def main() -> None:
    log("=== Memory compaction starting ===")

    cutoff_dt = datetime.now(timezone.utc) - timedelta(days=COMPACT_DAYS)
    cutoff_str = cutoff_dt.strftime("%Y-%m-%dT%H:%M:%S")
    week = get_week_label()

    conn = sqlite3.connect(str(CLAUDE_MEM_DB))
    try:
        rows = conn.execute(
            """SELECT id, title, subtitle, type, text, narrative, created_at
               FROM observations
               WHERE created_at < ?
               ORDER BY created_at ASC""",
            (cutoff_str,),
        ).fetchall()
    finally:
        conn.close()

    log(f"Found {len(rows)} observations older than {COMPACT_DAYS} days (before {cutoff_str[:10]})")

    if len(rows) < MIN_OBS_TO_COMPACT:
        log(f"Below threshold ({MIN_OBS_TO_COMPACT}) — skipping compaction")
        return

    date_range = (rows[0][6][:10], rows[-1][6][:10])
    output_file = SUMMARIES_DIR / f"{week}.md"

    # Build and run the summarization
    log(f"Building compact prompt for {len(rows)} observations...")
    prompt = build_prompt(week, rows, date_range)

    log("Calling Claude (Haiku) to generate summary...")
    summary_text = call_claude(prompt)

    # Write summary file
    SUMMARIES_DIR.mkdir(parents=True, exist_ok=True)
    output_file.write_text(summary_text)
    log(f"Written summary to: {output_file}")

    # Delete compacted observations
    obs_ids = [r[0] for r in rows]
    conn = sqlite3.connect(str(CLAUDE_MEM_DB))
    try:
        conn.execute(
            f"DELETE FROM observations WHERE id IN ({','.join('?' * len(obs_ids))})",
            obs_ids,
        )
        conn.commit()
    finally:
        conn.close()
    log(f"Deleted {len(obs_ids)} observations from claude-mem.db")

    # Update MEMORY.md
    update_memory_md(week)

    log(f"=== Compaction complete: {len(rows)} obs → {output_file.name} ===")


if __name__ == "__main__":
    main()
