# Innovius Capital — Retriever Health Smoke Test

## Overview
This is a lightweight health check that runs every 6 hours. It makes one minimal API call to each retriever source (Slack, Gmail, Granola), then posts a status summary to the #prometheus Slack channel. Use Haiku — this is a cost-sensitive task that runs 4× per day.

---

## Step 0 — Confirm Environment
Verify the following environment variables are loaded:
- SLACK_USER_TOKEN (used for reading channels)
- SLACK_BOT_TOKEN (used for posting to #prometheus)
- SLACK_TEAM_ID
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GRANOLA_MCP_URL

If SLACK_BOT_TOKEN is missing, log the error and exit — posting is not possible without it.

---

## Step 1 — Test Each Retriever

Run all three tests. Do NOT abort if one fails — collect all results first.

### Slack MCP
- Call: `slack_get_channel_history` on channel `#prometheus`, limit=1
- Success: call returns without error (even 0 messages is fine)
- Failure: any MCP error, timeout, or auth failure

### Gmail MCP
- Call: `search_emails` with query `newer_than:1d`, max_results=1
- Success: call returns without error (even 0 results is fine)
- Failure: any MCP error, timeout, or auth failure

### Granola MCP
- Call: list or search meetings with date range = today, limit=1
- Success: call returns without error (even 0 meetings is fine)
- Failure: any MCP error, timeout, or auth failure

---

## Step 2 — Post Status to #prometheus

The Slack MCP is read-only (OAuth scopes do not include chat:write). Post using a direct Bash curl call with SLACK_BOT_TOKEN instead.

Channel ID: $PROMETHEUS_CHANNEL

Build the message text, then post it with:

```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\":\"$PROMETHEUS_CHANNEL\",\"text\":\"<message>\"}"
```

Format the message text as follows (plain text):

```
Retriever Health Check — [HH:MM AM/PM] ET

Slack MCP      [✅ live | ❌ failed — <error summary>]
Gmail MCP      [✅ live | ❌ failed — <error summary>]
Granola MCP    [✅ live | ❌ failed — <error summary>]

Next brief: 9:11 AM ET [day-of-week]
Overall: [✅ All systems go | ⚠️ 1/3 retrievers down | 🚨 2/3 retrievers down | 🚨 All retrievers down]
```

Rules:
- Time = current time in ET (America/New_York), 12-hour format with AM/PM
- "Next brief" = next weekday (Mon–Fri) at 9:11 AM ET. If current time is before 9:11 AM ET today (weekday), next brief = today. Otherwise = next weekday.
- For failed sources, keep error summary to one short phrase (e.g. "auth error", "timeout", "MCP unreachable")
- Check the curl response for `"ok":true` — if false, log the error but do not retry

---

## Step 3 — Exit
Exit cleanly. Do not write to memory.db. This task does not update the brief or any state.
