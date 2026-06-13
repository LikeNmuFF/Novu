from flask import Flask, render_template, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__)

# Database setup for real download counts
DB_PATH = os.environ.get('DB_PATH', '/data/downloads.db')

def ensure_db_dir():
    """Ensure the database directory exists."""
    db_dir = os.path.dirname(DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

def init_db():
    """Initialize the database with the stats table."""
    ensure_db_dir()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY, count INTEGER)')
        cur = conn.cursor()
        cur.execute('SELECT count FROM stats WHERE id = 1')
        if not cur.fetchone():
            cur.execute('INSERT INTO stats (id, count) VALUES (1, 0)')
        conn.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/download-count')
def get_count():
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute('SELECT count FROM stats WHERE id = 1')
        count = cur.fetchone()[0]
        return jsonify({'count': count})

@app.route('/download')
def download():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('UPDATE stats SET count = count + 1 WHERE id = 1')
        conn.commit()
    # In a real scenario, this would serve the APK/IPA
    # return send_from_directory('static', 'app-release.apk')
    return jsonify({'status': 'download_started'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
