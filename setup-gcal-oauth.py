#!/usr/bin/env python3
"""
One-time Google Calendar OAuth setup for Prometheus Slack Bot.
Run this once on the VPS to authorize Calendar access.
Usage: python3 /home/prometheus/innovius-brief/setup-gcal-oauth.py
"""
import json, os, urllib.request, urllib.parse, webbrowser

KEYS_PATH  = os.path.expanduser("~/.gmail-mcp/gcp-oauth.keys.json")
TOKEN_PATH = os.path.expanduser("~/.gmail-mcp/calendar-token.json")
SCOPE      = "https://www.googleapis.com/auth/calendar"
REDIRECT   = "urn:ietf:wg:oauth:2.0:oob"

with open(KEYS_PATH) as f:
    keys = json.load(f)
installed = keys.get("installed") or keys.get("web") or {}
client_id     = installed["client_id"]
client_secret = installed["client_secret"]

auth_url = (
    "https://accounts.google.com/o/oauth2/auth?"
    + urllib.parse.urlencode({
        "client_id":     client_id,
        "redirect_uri":  REDIRECT,
        "response_type": "code",
        "scope":         SCOPE,
        "access_type":   "offline",
        "prompt":        "consent",
    })
)

print("\n=== Google Calendar OAuth Setup ===\n")
print("Open this URL in your browser and authorize access:\n")
print(auth_url)
print()
code = input("Paste the authorization code here: ").strip()

body = urllib.parse.urlencode({
    "code":          code,
    "client_id":     client_id,
    "client_secret": client_secret,
    "redirect_uri":  REDIRECT,
    "grant_type":    "authorization_code",
}).encode()

req = urllib.request.Request(
    "https://oauth2.googleapis.com/token", data=body, method="POST"
)
with urllib.request.urlopen(req) as r:
    tokens = json.load(r)

import time
tokens["expiry_date"] = int((time.time() + tokens.get("expires_in", 3600)) * 1000)

with open(TOKEN_PATH, "w") as f:
    json.dump(tokens, f, indent=2)

print(f"\n✅ Calendar token saved to {TOKEN_PATH}")
print("Restart the Slack bot to pick up the new credential.")
