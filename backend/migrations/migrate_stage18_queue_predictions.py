"""
Stage 18 migration.

Creates the temple_queue_predictions table inside varinet.db.
Running this migration more than once is safe.
"""

import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "varinet.db"


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS temple_queue_predictions (
    prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,

    prediction_date TEXT NOT NULL,
    hour INTEGER NOT NULL,

    zone_id TEXT NOT NULL,
    location TEXT NOT NULL,
    route_type TEXT NOT NULL,

    waiting_people INTEGER NOT NULL,
    gates_open INTEGER NOT NULL,
    crowd_count INTEGER NOT NULL,
    crowd_density REAL NOT NULL,

    darshan_status TEXT NOT NULL,
    is_peak_day INTEGER NOT NULL DEFAULT 0,
    day_of_week INTEGER NOT NULL,

    predicted_wait_minutes REAL NOT NULL,
    predicted_wait_label TEXT NOT NULL,

    requested_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


CREATE_ZONE_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS
idx_temple_queue_predictions_zone
ON temple_queue_predictions(zone_id);
"""


CREATE_DATE_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS
idx_temple_queue_predictions_created_at
ON temple_queue_predictions(created_at);
"""


def run_migration() -> None:
    connection = sqlite3.connect(DATABASE_PATH)

    try:
        connection.execute(CREATE_TABLE_SQL)
        connection.execute(CREATE_ZONE_INDEX_SQL)
        connection.execute(CREATE_DATE_INDEX_SQL)
        connection.commit()

        print("Stage 18 migration completed successfully.")
        print(f"Database: {DATABASE_PATH}")
        print("Table: temple_queue_predictions")

    finally:
        connection.close()


if __name__ == "__main__":
    run_migration()