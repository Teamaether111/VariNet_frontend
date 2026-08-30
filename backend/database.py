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
        conn.executescript("""
    CREATE TABLE IF NOT EXISTS zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        capacity INTEGER DEFAULT 0,
        latitude REAL,
        longitude REAL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS facilities (
        id TEXT PRIMARY KEY,
        zone_id TEXT,
        name TEXT NOT NULL,
        facility_type TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        capacity INTEGER DEFAULT 0,
        current_availability INTEGER DEFAULT 0,
        status TEXT DEFAULT 'AVAILABLE',
        contact_number TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS weather_observations (
        id TEXT PRIMARY KEY,
        zone_id TEXT NOT NULL,
        temperature REAL,
        humidity REAL,
        rainfall REAL DEFAULT 0,
        wind_speed REAL DEFAULT 0,
        weather_condition TEXT,
        observed_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS crowd_observations (
        id TEXT PRIMARY KEY,
        zone_id TEXT NOT NULL,
        crowd_count INTEGER NOT NULL DEFAULT 0,
        density REAL DEFAULT 0,
        movement_speed REAL DEFAULT 0,
        inflow_count INTEGER DEFAULT 0,
        outflow_count INTEGER DEFAULT 0,
        source TEXT DEFAULT 'MANUAL',
        observed_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS zone_risk_snapshots (
        id TEXT PRIMARY KEY,
        zone_id TEXT NOT NULL,
        crowd_risk REAL DEFAULT 0,
        weather_risk REAL DEFAULT 0,
        incident_risk REAL DEFAULT 0,
        queue_risk REAL DEFAULT 0,
        overall_risk REAL DEFAULT 0,
        risk_level TEXT DEFAULT 'LOW',
        explanation TEXT,
        calculated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        zone_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        recommended_action TEXT NOT NULL,
        reason TEXT,
        priority TEXT DEFAULT 'MEDIUM',
        expected_impact TEXT,
        status TEXT DEFAULT 'PENDING',
        approved_by TEXT,
        approved_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS volunteer_tasks (
        id TEXT PRIMARY KEY,
        recommendation_id TEXT,
        incident_id TEXT,
        zone_id TEXT,
        volunteer_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'MEDIUM',
        status TEXT DEFAULT 'PENDING',
        assigned_at TEXT DEFAULT (datetime('now')),
        accepted_at TEXT,
        completed_at TEXT,
        FOREIGN KEY (recommendation_id) REFERENCES recommendations(id),
        FOREIGN KEY (incident_id) REFERENCES incidents(id),
        FOREIGN KEY (zone_id) REFERENCES zones(id),
        FOREIGN KEY (volunteer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS temple_queue_snapshots (
        id TEXT PRIMARY KEY,
        zone_id TEXT,
        queue_length INTEGER DEFAULT 0,
        people_waiting INTEGER DEFAULT 0,
        entry_rate REAL DEFAULT 0,
        estimated_wait_minutes REAL DEFAULT 0,
        snapshot_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS queue_enclosures (
        id TEXT PRIMARY KEY,
        zone_id TEXT,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        gate_status TEXT DEFAULT 'OPEN',
        sequence_number INTEGER,
        status TEXT DEFAULT 'ACTIVE',
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS queue_predictions (
        id TEXT PRIMARY KEY,
        zone_id TEXT,
        enclosure_id TEXT,
        predicted_people INTEGER DEFAULT 0,
        predicted_wait_minutes REAL DEFAULT 0,
        confidence_score REAL DEFAULT 0,
        prediction_for TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (zone_id) REFERENCES zones(id),
        FOREIGN KEY (enclosure_id) REFERENCES queue_enclosures(id)
    );

    CREATE INDEX IF NOT EXISTS idx_facilities_zone
        ON facilities(zone_id);

    CREATE INDEX IF NOT EXISTS idx_weather_zone_time
        ON weather_observations(zone_id, observed_at);

    CREATE INDEX IF NOT EXISTS idx_crowd_zone_time
        ON crowd_observations(zone_id, observed_at);

    CREATE INDEX IF NOT EXISTS idx_risk_zone_time
        ON zone_risk_snapshots(zone_id, calculated_at);

    CREATE INDEX IF NOT EXISTS idx_recommendations_status
        ON recommendations(status);

    CREATE INDEX IF NOT EXISTS idx_tasks_volunteer_status
        ON volunteer_tasks(volunteer_id, status);
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
