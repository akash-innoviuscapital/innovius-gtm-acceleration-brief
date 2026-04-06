#!/usr/bin/env python3
"""
Prometheus — Innovius Slack Bot
Relay between Slack (DMs + @mentions) and Claude Code CLI.
Uses Socket Mode — no public URL or Cloudflare Tunnel needed.
"""
import os
import re
import json
import sqlite3
import subprocess
import logging
import datetime
import time
import urllib.request
import urllib.parse
from datetime import date, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

app = App(token=os.environ["SLACK_BOT_TOKEN"])



PROJECT_DIR = "/home/prometheus/innovius-brief"
AGENT_PROMPT_PATH = f"{PROJECT_DIR}/agents/slack-bot.md"

# Conversation history keyed by Slack channel ID — retains last N exchanges
conversation_history = {}
MAX_HISTORY = 10

# Keywords that indicate an action request — use Sonnet for these
ACTION_KEYWORDS = [
    "send", "email", "post", "message", "dm", "draft",
    "write to", "tell", "notify", "update the channel", "slack"
]


_brief_cache = {'date': None, 'context': ''}

# Company → relevant channel names
COMPANY_CHANNELS = {
    'cloudzero': ['p-cloudzero'],
    'delightree': ['p-delightree', 'delightree-gtm-acceleration'],
    'rightrev':   ['p-rightrev', 'rightrev-gtm-acceleration'],
    'clearml':    ['p-clearml'],
    'sewer-ai':   ['p-sewerai'],
    'auditoria':  ['p-auditoria'],
    'xcures':     ['p-xcures'],
    'innovius':   ['innovius-gtm-acceleration'],
}

# Keywords that identify which company a question is about
COMPANY_KEYWORDS = {
    'cloudzero': ['cloudzero', 'brady', 'matt katz', 'sharon', 'eric weiss', 'erik p', 'brenna', 'miguel', 'dan carducci'],
    'delightree': ['delightree', 'tushar', 'doug', 'adrian', 'griffin', 'erin'],
    'rightrev':   ['rightrev', 'right rev', 'jagan', 'joel', 'matthew', 'carolyn', 'alissa', 'natalie', 'kathy'],
    'clearml':    ['clearml', 'clear ml', 'moses', 'noam'],
    'sewer-ai':   ['sewer ai', 'sewerai', 'billy', 'turley', 'logan', 'cole', 'turley'],
    'auditoria':  ['auditoria', 'rohit', 'roi ', 'adina', 'maya', 'osborne'],
    'xcures':     ['xcures', 'x-cures', 'x cures', 'mika', 'bryan', 'xcures'],
    'innovius':   ['innovius', 'xiaolei', 'stu ', 'nicole', 'ethan', 'marci', 'koby', 'jasmine'],
}

# Keywords that mean "right now" — bypass cache entirely
FRESHNESS_KEYWORDS = ['just now', 'just sent', 'just got', 'right now', 'just messaged',
                      'just posted', 'just happened', 'just came in', 'just received']

# Meeting keywords — trigger Granola preload
MEETING_KEYWORDS = ['meeting', 'call', 'discuss', 'transcript', 'talked', 'spoke',
                    'granola', 'catchup', 'catch-up', 'we met', 'on a call', 'had a call']

_channel_id_map = {}   # channel name → id, populated once
_slack_cache   = {}    # frozenset(channel_names) → {'ts': float, 'text': str}
SLACK_CACHE_TTL = 60   # seconds


def _detect_channels(question: str) -> list:
    """Return the minimal set of channel names relevant to this question."""
    lower = question.lower()
    channels = ['prometheus']
    for company, keywords in COMPANY_KEYWORDS.items():
        if any(k in lower for k in keywords):
            channels.extend(COMPANY_CHANNELS.get(company, []))
    return list(dict.fromkeys(channels))  # dedupe, preserve order


def _resolve_channel_ids(slack_api_fn):
    """Populate _channel_id_map by listing all joined channels once."""
    cursor = None
    while True:
        params = {"limit": 200, "exclude_archived": "true", "types": "public_channel,private_channel"}
        if cursor:
            params["cursor"] = cursor
        data = slack_api_fn("conversations.list", params)
        for ch in data.get("channels", []):
            _channel_id_map[ch["name"]] = ch["id"]
        cursor = data.get("response_metadata", {}).get("next_cursor")
        if not cursor:
            break


def load_live_slack(question: str, hours_back: int = 24) -> str:
    """Fetch recent messages only from channels relevant to the question.
    Cached 60s per channel-set; bypassed entirely for 'just now' type queries."""
    user_token = os.environ.get("SLACK_USER_TOKEN", "")
    if not user_token:
        return ""

    now = time.time()
    bypass_cache = any(k in question.lower() for k in FRESHNESS_KEYWORDS)
    channel_names = _detect_channels(question)
    cache_key = frozenset(channel_names)

    if not bypass_cache:
        cached = _slack_cache.get(cache_key)
        if cached and now - cached['ts'] < SLACK_CACHE_TTL:
            return cached['text']

    oldest = str(int(now - hours_back * 3600))
    parts = []

    def slack_api(method, params):
        url = f"https://slack.com/api/{method}?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {user_token}"})
        try:
            with urllib.request.urlopen(req, timeout=8) as r:
                return json.loads(r.read())
        except Exception:
            return {}

    if not _channel_id_map:
        _resolve_channel_ids(slack_api)

    for channel_name in channel_names:
        channel_id = _channel_id_map.get(channel_name)
        if not channel_id:
            continue
        data = slack_api("conversations.history", {"channel": channel_id, "oldest": oldest, "limit": 20})
        messages = data.get("messages", [])
        if not messages:
            continue

        user_ids = {m.get("user") for m in messages if m.get("user")}
        user_names = {}
        for uid in user_ids:
            udata = slack_api("users.info", {"user": uid})
            profile = udata.get("user", {}).get("profile", {})
            user_names[uid] = profile.get("display_name") or profile.get("real_name") or uid

        lines = []
        for m in reversed(messages):
            if m.get("subtype"):
                continue
            ts = datetime.datetime.fromtimestamp(float(m.get("ts", 0)), tz=timezone.utc)
            user = user_names.get(m.get("user", ""), "unknown")
            text = re.sub(r"<@[A-Z0-9]+>", "", m.get("text", "")).strip()
            if text:
                lines.append(f"  [{ts.strftime('%m/%d %H:%M UTC')}] {user}: {text[:200]}")

        if lines:
            parts.append(f"\n#{channel_name} (last {hours_back}h):")
            parts.extend(lines)

    result = "\n".join(parts)
    _slack_cache[cache_key] = {'ts': now, 'text': result}
    log.info(f"Live Slack: fetched {len(channel_names)} channels ({'bypass' if bypass_cache else '60s cache'})")
    return result


def load_granola_context(question: str) -> str:
    """Fetch recent Granola meetings when question is about meetings or calls."""
    if not any(k in question.lower() for k in MEETING_KEYWORDS):
        return ""
    if not os.environ.get("GRANOLA_AUTH_TOKEN"):
        return ""

    prompt = """Use granola MCP tools to list the 8 most recent meetings from the last 7 days.
For each: date, participants, 1-2 sentence summary of key topics discussed.
Return plain text only — no preamble, no markdown headers."""

    try:
        result = subprocess.run(
            ["claude", "--dangerously-skip-permissions", "--model", "claude-haiku-4-5-20251001", "-p", prompt],
            capture_output=True, text=True, timeout=45, cwd=PROJECT_DIR, stdin=subprocess.DEVNULL,
        )
        text = result.stdout.strip()
        if text:
            log.info(f"Granola context loaded: {len(text)} chars")
        return text
    except Exception as e:
        log.warning(f"Granola preload failed: {e}")
        return ""


def load_brief_context() -> str:
    """Load today's brief snapshot and open actions. Cached per calendar day."""
    today = date.today().isoformat()
    if _brief_cache['date'] == today and _brief_cache['context']:
        return _brief_cache['context']

    parts = []

    # ── 1. Parse brief-data.js for hot signals, hot actions, per-company touch ──
    try:
        brief_js = f"{PROJECT_DIR}/dashboard/brief-data.js"
        with open(brief_js) as f:
            content = f.read()
        m = re.search(r'const BRIEF_DATA\s*=\s*', content)
        if m:
            raw, _ = json.JSONDecoder().raw_decode(content[m.end():].strip())
            # Structure: { _history: [ {day}, {day}, ... ] }  OR  [ {day}, ... ]
            if isinstance(raw, dict) and '_history' in raw:
                day = raw['_history'][0]
            elif isinstance(raw, list):
                day = raw[0]
            else:
                day = raw

            def clean_bullet(b):
                b = b.strip('[]')
                b = re.sub(r'\s*·?\s*\[?SOURCE:.*$', '', b, flags=re.IGNORECASE)
                return b.strip(' ]·')

            hot_signals = day.get('_hotSignals', [])
            if hot_signals:
                parts.append("## Today's Hot Signals")
                for s in hot_signals[:6]:
                    parts.append(f"- {clean_bullet(s)}")

            companies = ['Sewer AI','Auditoria','CloudZero','Delightree','X-Cures','ClearML','RightRev','Innovius']
            co_lines = []
            for co in companies:
                co_data = day.get(co, {})
                if not co_data:
                    continue
                last_touch = co_data.get('lastTouch', '')
                actions = co_data.get('action', [])[:3]
                if last_touch or actions:
                    co_lines.append(f"\n*{co}* — last touch: {last_touch}")
                    for a in actions:
                        co_lines.append(f"  → {re.sub(r'^\[Action\]\s*', '', a, flags=re.IGNORECASE).strip()}")
            if co_lines:
                parts.append("\n## Company Last Touch & Actions")
                parts.extend(co_lines)

        brief_date = day.get('_date', 'unknown')
        parts.insert(0, f"*Brief date: {brief_date}*\n")
    except Exception as e:
        log.warning(f"Brief context: could not parse brief-data.js — {e}")

    # ── 2. Hot Actions from DB (hot_action=1 or semantic_importance=1) ──
    try:
        conn = sqlite3.connect(f"{PROJECT_DIR}/memory/memory.db")
        hot_rows = conn.execute(
            "SELECT company, content, "
            "CAST(julianday('now') - julianday(date_created) AS INTEGER) as days_open, "
            "hot_action, semantic_importance "
            "FROM actions WHERE checked=0 AND (hot_action=1 OR semantic_importance=1) "
            "ORDER BY date_created"
        ).fetchall()
        if hot_rows:
            parts.append("\n## Hot Actions (DB)")
            for co, content, days, hot, importance in hot_rows:
                clean = re.sub(r'^\[' + re.escape(co) + r'\s*·\s*', '', content)
                clean = re.sub(r'\s*·?\s*\[?SOURCE:.*$', '', clean, flags=re.IGNORECASE).strip(' ]')
                flags = []
                if hot: flags.append('HOT')
                if importance: flags.append('IMPORTANT')
                tag = f" [{'/'.join(flags)}]" if flags else ''
                age = f"Day {days}" if days > 0 else "today"
                parts.append(f"- [{co}]{tag} {clean} ({age})")

        # ── 3. All open actions from DB ──
        rows = conn.execute(
            "SELECT company, content, "
            "CAST(julianday('now') - julianday(date_created) AS INTEGER) as days_open, "
            "hot_action, semantic_importance "
            "FROM actions WHERE checked=0 ORDER BY date_created"
        ).fetchall()
        conn.close()
        if rows:
            parts.append("\n## All Open Actions in DB")
            for co, content, days, hot, importance in rows:
                clean = re.sub(r'^\[' + re.escape(co) + r'\s*·\s*', '', content)
                clean = re.sub(r'\s*·?\s*\[?SOURCE:.*$', '', clean, flags=re.IGNORECASE).strip(' ]')
                flags = []
                if hot: flags.append('HOT')
                if importance: flags.append('IMPORTANT')
                tag = f" [{'/'.join(flags)}]" if flags else ''
                age = f"Day {days}" if days > 0 else "today"
                parts.append(f"- [{co}]{tag} {clean} ({age})")
    except Exception as e:
        log.warning(f"Brief context: could not load open actions — {e}")

    # ── 4. Company context cards ──
    try:
        co_card_map = {
            'Sewer AI': 'sewer-ai.md', 'Auditoria': 'auditoria.md',
            'CloudZero': 'cloudzero.md', 'Delightree': 'delightree.md',
            'X-Cures': 'xcures.md', 'ClearML': 'clearml.md',
            'RightRev': 'rightrev.md', 'Innovius': 'innovius.md',
        }
        card_parts = []
        for co, fname in co_card_map.items():
            path = f"{PROJECT_DIR}/memory/companies/{fname}"
            if os.path.exists(path):
                with open(path) as f:
                    card_text = f.read().strip()
                if card_text:
                    card_parts.append(f"\n### {co}\n{card_text}")
        if card_parts:
            parts.append("\n## Company Context Cards")
            parts.extend(card_parts)
    except Exception as e:
        log.warning(f"Brief context: could not load company cards — {e}")

    context = "\n".join(parts)
    _brief_cache['date'] = today
    _brief_cache['context'] = context
    log.info(f"Brief context loaded: {len(context)} chars")
    return context


def load_agent_prompt():
    try:
        with open(AGENT_PROMPT_PATH) as f:
            return f.read()
    except Exception as e:
        return f"# Prometheus Bot\nYou are Prometheus, an intelligence agent for Akash Bose at Innovius Capital."


def md_to_slack(text: str) -> str:
    """Convert standard markdown to Slack mrkdwn format."""
    # Bold: **text** or __text__ → *text*
    text = re.sub(r'\*\*(.+?)\*\*', r'*\1*', text, flags=re.DOTALL)
    text = re.sub(r'__(.+?)__', r'*\1*', text, flags=re.DOTALL)
    # Headings: ## Title → *Title*
    text = re.sub(r'^#{1,6}\s+(.+)$', r'*\1*', text, flags=re.MULTILINE)
    # Horizontal rules → blank line
    text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)
    return text


def pick_model(text):
    """Use Haiku for read/query requests (~10s), Sonnet for actions (~30-60s)."""
    lower = text.lower()
    if any(k in lower for k in ACTION_KEYWORDS):
        return "claude-sonnet-4-6"
    return "claude-haiku-4-5-20251001"


def run_claude(user_text, source_context, history=None):
    model = pick_model(user_text)
    agent_prompt = load_agent_prompt()
    brief_context = load_brief_context()

    history_block = ""
    if history:
        lines = []
        for role, text in history:
            lines.append(f"{role}: {text}")
        history_block = "\n\n## Conversation so far\n" + "\n".join(lines)

    brief_block = f"\n\n## Preloaded Brief Context\n{brief_context}" if brief_context else ""

    live_slack = load_live_slack(user_text)
    slack_block = f"\n\n## Live Slack Activity (last 24h)\n{live_slack}" if live_slack else ""

    granola = load_granola_context(user_text)
    granola_block = f"\n\n## Recent Granola Meetings\n{granola}" if granola else ""

    prompt = f"""{agent_prompt}{brief_block}{slack_block}{granola_block}{history_block}

---

SOURCE CONTEXT: {source_context}

Akash says: {user_text}"""

    try:
        result = subprocess.run(
            [
                "claude",
                "--dangerously-skip-permissions",
                "--model", model,
                "-p", prompt,
            ],
            capture_output=True,
            text=True,
            timeout=180,
            cwd=PROJECT_DIR,
            stdin=subprocess.DEVNULL,
        )
        response = result.stdout.strip()
        if not response and result.stderr.strip():
            return f"_Error from Claude: {result.stderr.strip()[:200]}_"
        return response or "_No response generated._"
    except subprocess.TimeoutExpired:
        return "_Query timed out (>3 min). Try a more specific request._"
    except FileNotFoundError:
        return "_Claude CLI not found. Check that `claude` is in PATH._"
    except Exception as e:
        return f"_Unexpected error: {e}_"


@app.event("message")
def handle_dm(event, say):
    """Handle direct messages to the bot."""
    log.info(f"message event: channel_type={event.get('channel_type')} subtype={event.get('subtype')} bot_id={event.get('bot_id')} text={repr(event.get('text','')[:50])}")

    # Only respond to DMs
    if event.get("channel_type") != "im":
        log.info("Ignoring: not a DM")
        return
    # Ignore bot messages and edits/deletes
    if event.get("bot_id") or event.get("subtype"):
        log.info("Ignoring: bot message or subtype")
        return

    user_text = event.get("text", "").strip()
    if not user_text:
        return

    log.info(f"Processing DM: {repr(user_text[:80])}")
    say("_On it..._")

    source_context = (
        "Direct message from Akash. You are responding privately — "
        "no sensitivity filter needed on this reply. "
        "However, if you take an action that posts to a public Slack channel, "
        "apply the sensitivity filter to that channel post."
    )

    channel_id = event.get("channel")
    history = conversation_history.get(channel_id, [])
    response = run_claude(user_text, source_context, history)
    log.info(f"Claude response length: {len(response)} chars")

    # Update history
    history.append(("Akash", user_text))
    history.append(("Prometheus", response))
    conversation_history[channel_id] = history[-MAX_HISTORY * 2:]

    say(md_to_slack(response))


@app.event("app_mention")
def handle_mention(event, say):
    """Handle @prometheus mentions in channels."""
    log.info(f"app_mention event: channel={event.get('channel')} text={repr(event.get('text','')[:50])}")
    # Strip the @mention prefix from the message
    raw_text = event.get("text", "")
    user_text = re.sub(r"<@[A-Z0-9]+>", "", raw_text).strip()

    if not user_text:
        say("_Yes? Ask me something._")
        return

    channel = event.get("channel", "a channel")

    say("_On it..._")

    source_context = (
        f"@mention in Slack channel {channel}. "
        "Your reply will be visible to everyone in this channel — apply the sensitivity filter: "
        "never mention layoffs, RIFs, terminations, headcount reductions, or firing in this reply "
        "or in any subsequent channel posts you make as part of this action."
    )

    history = conversation_history.get(channel, [])
    response = run_claude(user_text, source_context, history)

    history.append(("Akash", user_text))
    history.append(("Prometheus", response))
    conversation_history[channel] = history[-MAX_HISTORY * 2:]

    say(md_to_slack(response))


@app.action("approve_patch")
def handle_approve_patch(ack, body, client):
    ack()
    patch_id = body["actions"][0]["value"]
    patch_path = f"{PROJECT_DIR}/memory/pending-patches/{patch_id}.json"
    channel_id = body["channel"]["id"]
    msg_ts = body["message"]["ts"]

    try:
        with open(patch_path) as f:
            patch = json.load(f)

        with open(patch["file"]) as f:
            content = f.read()

        if patch["old_string"] not in content:
            result_text = f"⚠️ Patch `{patch_id}` could not be applied — old string not found (may already be fixed)."
        else:
            new_content = content.replace(patch["old_string"], patch["new_string"], 1)
            with open(patch["file"], "w") as f:
                f.write(new_content)
            result_text = f"✅ Applied — `{patch['file']}` patched. Reason: {patch['reason']}"
            ts = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            with open(f"{PROJECT_DIR}/memory/run-monitor.log", "a") as f:
                f.write(f"[{ts}] RUN_ID={patch['run_id']} APPLIED (approved via Slack): {patch['file']} — {patch['reason']}\n")

    except FileNotFoundError:
        result_text = f"⚠️ Patch file `{patch_id}.json` not found — may have already been applied or expired."
    except Exception as e:
        result_text = f"⚠️ Error applying patch: {e}"

    client.chat_update(channel=channel_id, ts=msg_ts, text=result_text, blocks=[
        {"type": "section", "text": {"type": "mrkdwn", "text": result_text}}
    ])


@app.action("skip_patch")
def handle_skip_patch(ack, body, client):
    ack()
    patch_id = body["actions"][0]["value"]
    channel_id = body["channel"]["id"]
    msg_ts = body["message"]["ts"]
    result_text = f"⏭️ Skipped patch `{patch_id}`."
    try:
        ts = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        with open(f"{PROJECT_DIR}/memory/run-monitor.log", "a") as f:
            f.write(f"[{ts}] SKIPPED (via Slack): {patch_id}\n")
    except Exception:
        pass
    client.chat_update(channel=channel_id, ts=msg_ts, text=result_text, blocks=[
        {"type": "section", "text": {"type": "mrkdwn", "text": result_text}}
    ])


if __name__ == "__main__":
    log.info("Starting Prometheus Slack Bot...")
    log.info(f"Project dir: {PROJECT_DIR}")
    log.info(f"Agent prompt: {AGENT_PROMPT_PATH}")
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()
