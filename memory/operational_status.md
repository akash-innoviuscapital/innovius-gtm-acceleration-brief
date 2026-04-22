# Operational Status — Innovius Capital Daily Brief System

## Last Run
**Run ID:** 20260421-0551
**Date:** 2026-04-21 (Tuesday)
**Status:** COMPLETE

## Run Metrics (20260421-0551)
- Slack Channels (A1): 24 calls · 1 signal (within Tue early-morning baseline)
- Slack DMs (A2): 2 calls · 1 signal (no auth failure)
- Gmail (B): 12 calls · 10 signals (strong)
- Granola (C): 5 calls · 4 signals
- CloudZero retriever: STALE — Day 11 (last push Apr 10), contributed 9 signals from pre-ingested data
- Total signals retrieved: 25
- Companies covered: 7/7
- Claims submitted: 38
- Kept: 36 · Dropped: 1 · Rewritten: 2
- Drop rate: 2.7% (excellent)
- Hot Signals: 4 · Hot Actions: 5
- UNVERIFIED flags: 0
- MAPPING AMBIGUOUS flags: 0
- Mapping corrections: 1
- Self-healed: none

## Known Issues
- **CloudZero ingest STALE — Day 11** (as of 2026-04-21): No fresh CloudZero Slack data since Apr 10. Must push via POST /innovius-brief/cloudzero-ingest from Mac. 11-day blackout — security incident surfaced via stale ingest data only.

## Prior Runs (recent)
| Run ID | Date | Hot Sig | Hot Act | Drop Rate | Failed Sources |
|--------|------|---------|---------|-----------|----------------|
| 20260421-0551 | Apr 21 | 4 | 5 | 2.7% | CloudZero stale Day 11 |
| 20260420-0553 | Apr 20 | 4 | 5 | 3.3% | CloudZero stale Day 10 |
| 20260417-0550 | Apr 17 | 4 | 7 | 2.6% | CloudZero stale Day 7 |
| 20260416-0550 | Apr 16 | 3 | 7 | 0.0% | CloudZero stale Day 6 |
| 20260415-0551 | Apr 15 | 1 | 4 | 6.1% | CloudZero stale Day 5 |

## System Health
- Pre-flight: all green (last validated 2026-04-21 5:51 AM ET)
- memory.db: healthy — 22 runs in run_quality table
- brief-data.js: written (newest first)
- run-monitor.log: logging normally
- Slack post to #prometheus: operational

## Open Carry-overs (as of Apr 21)
- 12 open actions · oldest Day 11 (X-Cures: Eric Svetcov tech audit ID:129)
- X-Cures: Eric Svetcov tech audit Day 11 — credibility risk, Hot Action
- Cross-Portfolio: Lock announcement dates for ClearML/Delightree/X-Cures (Day 5) — Hot Action
- CloudZero: Activate Dragoneer path for Brady's Roblox deal (Day 1)
- Delightree: Account scoring phases 1-2 due Apr 22-24 (Day 1) — due tomorrow
- Edwin Dang call confirmed Apr 27 4pm ET (resolves prior carry-over)
