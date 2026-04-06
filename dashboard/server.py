#!/usr/bin/env python3
"""
Innovius Capital — Daily Brief Dashboard Server
Serves the brief dashboard on port 8080
Run: python3 /root/innovius-brief/dashboard/server.py
"""

import http.server
import socketserver
import os
import json
import re
import sqlite3
import subprocess
import tempfile
from urllib.parse import unquote
import threading
from datetime import date, datetime

PORT = 8080
DASHBOARD_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(os.path.dirname(DASHBOARD_DIR), 'memory', 'memory.db')
COMPANIES_DIR = os.path.join(os.path.dirname(DASHBOARD_DIR), 'memory', 'companies')
JUDGMENT_LOG = os.path.join(os.path.dirname(DASHBOARD_DIR), 'memory', 'judgment.log')

# Matches [CARRY-OVER · Day N · ID:42] prefix in action text
CARRYOVER_RE = re.compile(r'^\[CARRY-OVER[^\]]*ID:(\d+)\]')
# Matches id:42 content key (new stable ID-based scheme)
ID_KEY_RE = re.compile(r'^id:(\d+)$')

CLOUDZERO_INGEST_DIR = os.path.join(os.path.dirname(DASHBOARD_DIR), 'memory', 'cloudzero-ingest')
CLOUDZERO_ALLOWED_FILES = {'slack-channels-raw.json', 'slack-members-raw.json', 'email-raw.json'}

COMPANY_FILES = {
    'Auditoria': 'auditoria.md',
    'ClearML': 'clearml.md',
    'CloudZero': 'cloudzero.md',
    'Delightree': 'delightree.md',
    'Innovius': 'innovius.md',
    'RightRev': 'rightrev.md',
    'Sewer AI': 'sewer-ai.md',
    'X-Cures': 'xcures.md',
}

PLACEHOLDER = 'No context recorded yet'


def _log_judgment(msg: str) -> None:
    ts = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    line = f'[{ts}] {msg}\n'
    try:
        with open(JUDGMENT_LOG, 'a') as f:
            f.write(line)
    except Exception:
        pass


def _synthesize_judgment(company: str, old_content: str, new_text: str) -> None:
    """Background thread: synthesize old + new context via Claude Haiku, write atomically."""
    try:
        card_path = os.path.join(COMPANIES_DIR, COMPANY_FILES[company])

        is_empty = not old_content.strip() or PLACEHOLDER in old_content
        if is_empty:
            result = f'## {company} — Interpretive Context\n\n{new_text.strip()}\n'
            _log_judgment(f'{company}: first entry written directly (no prior context)')
        else:
            prompt = (
                f'You are updating the interpretive context for {company} in the Innovius Capital '
                f'brief pipeline. This context helps the synthesizer and validator understand how to '
                f'read signals from this company — it is NOT a summary of facts (those live in the '
                f'database). It is judgment: patterns, caveats, how to interpret who says what.\n\n'
                f'Existing context:\n{old_content}\n\n'
                f'New judgment submitted:\n{new_text}\n\n'
                f'Synthesize into a single coherent interpretive context document. Be dense. '
                f'Preserve all specific names and patterns. Remove redundancy. '
                f'Output only the markdown content — no preamble.'
            )
            proc = subprocess.run(
                ['claude', '--dangerously-skip-permissions',
                 '--model', 'claude-haiku-4-5-20251001',
                 '--output-format', 'json', '-p', prompt],
                capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=120
            )
            if proc.returncode != 0:
                _log_judgment(f'{company}: claude error — {proc.stderr[:200]}')
                return
            try:
                outer = json.loads(proc.stdout)
                result = outer.get('result', proc.stdout) if isinstance(outer, dict) else proc.stdout
            except json.JSONDecodeError:
                result = proc.stdout
            _log_judgment(f'{company}: synthesis complete')

        # Atomic write
        fd, tmp_path = tempfile.mkstemp(dir=COMPANIES_DIR, suffix='.tmp')
        try:
            with os.fdopen(fd, 'w') as f:
                f.write(result)
            os.replace(tmp_path, card_path)
        except Exception:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
            raise

    except Exception as e:
        _log_judgment(f'{company}: ERROR in background synthesis — {e}')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DASHBOARD_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress access logs to keep output clean
        pass

    def do_POST(self):
        if self.path == '/innovius-brief/save-state':
            self._handle_save_state()
        elif self.path == '/innovius-brief/judgment':
            self._handle_save_judgment()
        elif self.path == '/innovius-brief/add-action':
            self._handle_add_action()
        elif self.path == '/innovius-brief/cloudzero-ingest':
            self._handle_cloudzero_ingest()
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path.startswith('/innovius-brief/action-state.json'):
            self._handle_load_state()
        elif self.path.startswith('/innovius-brief/judgment/'):
            self._handle_load_judgment()
        else:
            super().do_GET()

    def _handle_save_state(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            actions = body.get('actions', {})
            today = date.today().isoformat()

            conn = sqlite3.connect(DB_PATH)
            try:
                for key, checked in actions.items():
                    if '||' not in key:
                        continue
                    company, content = key.split('||', 1)
                    checked_int = 1 if checked else 0
                    completed = today if checked else None

                    # Case 1: ID-based key — company||id:X (primary scheme)
                    # Also handles legacy _hot||id:X keys from old briefs during transition.
                    id_m = ID_KEY_RE.match(content)
                    if id_m:
                        action_id = int(id_m.group(1))
                        conn.execute(
                            'UPDATE actions SET checked=?, date_completed=? WHERE id=?',
                            (checked_int, completed, action_id)
                        )
                        continue

                    # Case 2: Legacy carry-over prefix [CARRY-OVER · Day N · ID:X] (backward compat)
                    m = CARRYOVER_RE.match(content)
                    if m:
                        action_id = int(m.group(1))
                        conn.execute(
                            'UPDATE actions SET checked=?, date_completed=? WHERE id=?',
                            (checked_int, completed, action_id)
                        )
                        continue

                    # Case 3: company||content — fallback for items without IDs
                    # (only occurs for items added before ID-based keying was in place)
                    # UPDATE only — never INSERT here; new rows come exclusively from /add-action
                    if company != '_hot':
                        rows_updated = conn.execute(
                            'UPDATE actions SET checked=?, date_completed=? WHERE company=? AND content=?',
                            (checked_int, completed, company, content)
                        ).rowcount
                        if rows_updated == 0:
                            print(f'WARN save-state Case 3: no match for {company}||{content[:60]}')

                # Trim checked rows older than 14 days to keep table lean
                conn.execute(
                    "DELETE FROM actions WHERE checked=1 AND date_created <= date('now', '-14 days')"
                )
                conn.commit()
            finally:
                conn.close()

            response = json.dumps({'ok': True}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        except Exception as e:
            self.send_error(500, str(e))

    def _handle_load_state(self):
        try:
            conn = sqlite3.connect(DB_PATH)
            try:
                rows = conn.execute("""
                    SELECT id, company, content, checked, date_created, source_tag,
                           hot_action, semantic_importance,
                           CAST(julianday('now') - julianday(date_created) AS INTEGER) as days_open
                    FROM actions WHERE date_created >= date('now', '-14 days')
                """).fetchall()
            finally:
                conn.close()

            actions = {}
            dashboard_actions = []
            all_actions = []
            for action_id, company, content, checked, date_created, source_tag, hot_action, semantic_importance, days_open in rows:
                checked_val = bool(checked)
                hot = bool(hot_action)
                important = bool(semantic_importance)
                if hot and important:
                    urgency = 'red'
                elif hot and days_open >= 3:
                    urgency = 'red'
                elif hot:
                    urgency = 'yellow'
                elif important:
                    urgency = 'yellow'
                else:
                    urgency = None

                # Single key scheme for all actions — company||id:N regardless of age.
                # No _hot mirror keys. One key per action, no conflicts.
                actions[f'{company}||id:{action_id}'] = checked_val

                # Collect dashboard-added actions for the Add Action panel
                if source_tag == 'dashboard':
                    dashboard_actions.append({
                        'id': action_id,
                        'company': company,
                        'content': content,
                        'checked': checked_val
                    })

                # allActions: full list for Hot Actions panel and company sections
                all_actions.append({
                    'id': action_id,
                    'company': company,
                    'content': content,
                    'checked': checked_val,
                    'date_created': date_created,
                    'days_open': days_open or 0,
                    'hot_action': bool(hot_action),
                    'semantic_importance': bool(semantic_importance),
                    'urgency': urgency  # kept for backward compat: 'red' | 'yellow' | None
                })

            # Sort: open items first (semantic_importance → hot_action → days_open), then completed
            all_actions.sort(key=lambda a: (
                1 if a['checked'] else 0,
                0 if a['semantic_importance'] else 1,
                0 if a['hot_action'] else 1,
                -(a['days_open'])
            ))

            response = json.dumps({
                'actions': actions,
                'dashboardActions': dashboard_actions,
                'allActions': all_actions
            }).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        except Exception as e:
            self.send_error(500, str(e))

    def _handle_add_action(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            company = body.get('company', '').strip()
            content = body.get('content', '').strip()
            if not company or not content:
                self.send_error(400, 'company and content required')
                return
            today = date.today().isoformat()
            conn = sqlite3.connect(DB_PATH)
            try:
                cursor = conn.execute(
                    'INSERT INTO actions (date_created, company, content, checked, source_tag)'
                    ' VALUES (?, ?, ?, 0, "dashboard")',
                    (today, company, content)
                )
                action_id = cursor.lastrowid
                conn.commit()
            finally:
                conn.close()
            response = json.dumps({'ok': True, 'id': action_id}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
        except Exception as e:
            self.send_error(500, str(e))

    def _handle_load_judgment(self):
        try:
            company = unquote(self.path.split('/innovius-brief/judgment/', 1)[-1])
            filename = COMPANY_FILES.get(company)
            content = ''
            if filename:
                card_path = os.path.join(COMPANIES_DIR, filename)
                try:
                    with open(card_path) as f:
                        raw = f.read()
                    # Return empty string if still placeholder
                    content = '' if PLACEHOLDER in raw else raw
                except FileNotFoundError:
                    content = ''

            response = json.dumps({'company': company, 'content': content}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        except Exception as e:
            self.send_error(500, str(e))

    def _handle_save_judgment(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            company = body.get('company', '').strip()
            new_text = body.get('text', '').strip()

            if company not in COMPANY_FILES or not new_text:
                self.send_error(400, 'Invalid company or empty text')
                return

            # Read current content
            card_path = os.path.join(COMPANIES_DIR, COMPANY_FILES[company])
            try:
                with open(card_path) as f:
                    old_content = f.read()
            except FileNotFoundError:
                old_content = ''

            # Fire background synthesis — return immediately
            t = threading.Thread(
                target=_synthesize_judgment,
                args=(company, old_content, new_text),
                daemon=True
            )
            t.start()
            _log_judgment(f'{company}: synthesis job queued')

            response = json.dumps({'ok': True, 'status': 'queued'}).encode()
            self.send_response(202)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        except Exception as e:
            self.send_error(500, str(e))

    def _handle_cloudzero_ingest(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            filename = body.get('filename', '').strip()
            data = body.get('data')
            if filename not in CLOUDZERO_ALLOWED_FILES or data is None:
                self.send_error(400, 'Invalid filename or missing data')
                return
            # Atomic write
            dest = os.path.join(CLOUDZERO_INGEST_DIR, filename)
            fd, tmp = tempfile.mkstemp(dir=CLOUDZERO_INGEST_DIR, suffix='.tmp')
            try:
                with os.fdopen(fd, 'w') as f:
                    json.dump(data, f)
                os.replace(tmp, dest)
            except Exception:
                try:
                    os.unlink(tmp)
                except Exception:
                    pass
                raise
            # Update freshness timestamp
            ts = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            with open(os.path.join(CLOUDZERO_INGEST_DIR, '.last-updated'), 'w') as f:
                f.write(ts)
            response = json.dumps({'ok': True, 'file': filename, 'ts': ts}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
        except Exception as e:
            self.send_error(500, str(e))

if __name__ == "__main__":
    os.chdir(DASHBOARD_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Innovius Brief Dashboard running at http://104.236.31.146:{PORT}")
        print("Press Ctrl+C to stop.")
        httpd.serve_forever()
