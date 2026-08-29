"""
VARI-Net Database Layer
Uses SQLite (single file, zero setup) - perfect for hackathon deployment.
Stores: users (with hashed passwords), incidents, recommendations.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "varinet.db"

DB_PATH = "varinet.db"


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('pilgrim','volunteer','police','temple-authority')),
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                type TEXT, title TEXT, description TEXT,
                zone_id TEXT, zone_name TEXT,
                priority TEXT, status TEXT DEFAULT 'NEW',
                reported_by TEXT, reported_role TEXT,
                location_details TEXT,
                coord_x REAL, coord_y REAL,
                evidence_url TEXT, audio_note TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                resolved_at TEXT
            )
        """)
        conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
