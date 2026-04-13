# CloudZero Ingest Folder

Files pushed here by the CloudZero pipeline on Akash's Mac are read by `agents/retrieval-cloudzero.md` at each 5:50 AM brief run.

## Expected files

| File | Source |
|------|--------|
| `slack-channels-raw.json` | CloudZero Slack channel retriever |
| `slack-members-raw.json` | CloudZero Slack DM retriever |
| `email-raw.json` | CloudZero Gmail retriever |
| `.last-updated` | Written automatically by server on each successful POST |

## Mac-side push commands

Run these at the end of the CloudZero pipeline (once per file):

```bash
curl -s -X POST https://dashboard.runprometheus.com/innovius-brief/cloudzero-ingest \
  -H "Content-Type: application/json" \
  -d "{\"filename\": \"slack-channels-raw.json\", \"data\": $(cat /path/to/slack-channels-raw.json)}"

curl -s -X POST https://dashboard.runprometheus.com/innovius-brief/cloudzero-ingest \
  -H "Content-Type: application/json" \
  -d "{\"filename\": \"slack-members-raw.json\", \"data\": $(cat /path/to/slack-members-raw.json)}"

curl -s -X POST https://dashboard.runprometheus.com/innovius-brief/cloudzero-ingest \
  -H "Content-Type: application/json" \
  -d "{\"filename\": \"email-raw.json\", \"data\": $(cat /path/to/email-raw.json)}"
```

Each call returns `{"ok": true, "file": "...", "ts": "..."}` on success.

## Freshness

The CloudZero retriever agent checks `.last-updated` before reading files. If the timestamp is older than 24h (or missing), it emits a graceful skip and the brief runs with 4 sources instead of 5.
