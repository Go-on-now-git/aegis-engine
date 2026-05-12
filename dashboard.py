#!/usr/bin/env python3
"""Live dashboard for AEGIS 2026 — serves state.json to the web UI."""
from flask import Flask, jsonify, send_from_directory
import json, os

app = Flask(__name__, static_folder='dashboard/static')
STATE = os.path.join(os.path.dirname(__file__), 'state.json')

@app.route('/')
def index():
    return send_from_directory('dashboard', 'index.html')

@app.route('/api/state')
def state():
    if not os.path.exists(STATE):
        return jsonify({'capital': 25.0, 'pnl': 0.0, 'trades': 0, 'log': []})
    with open(STATE) as f:
        return jsonify(json.load(f))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7070, debug=False)
