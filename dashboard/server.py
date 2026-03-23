#!/usr/bin/env python3
"""
Innovius Capital — Daily Brief Dashboard Server
Serves the brief dashboard on port 8080
Run: python3 /root/innovius-brief/dashboard/server.py
"""

import http.server
import socketserver
import os

PORT = 8080
DASHBOARD_DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DASHBOARD_DIR, **kwargs)

    def log_message(self, format, *args):
        # Suppress access logs to keep output clean
        pass

if __name__ == "__main__":
    os.chdir(DASHBOARD_DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Innovius Brief Dashboard running at http://104.236.31.146:{PORT}")
        print("Press Ctrl+C to stop.")
        httpd.serve_forever()
