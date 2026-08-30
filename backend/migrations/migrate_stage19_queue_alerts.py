"""
Stage 19 migration.

Creates the queue_alerts table used for explainable
temple queue recommendations.
"""

import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "varinet.db"


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS queue_alerts (
    alert_id INTEGER PRIMARY KEY AUTOINCREMENT,

    prediction_id INTEGER NOT NULL UNIQUE,
    zone_id TEXT NOT NULL,

    alert_level TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    explanation TEXT NOT NULL,
    recommended_action TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'PENDING',
    reviewed_by TEXT,
    reviewed_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (prediction_id)
        REFERENCES temple_queue_predictions(prediction_id)
        ON DELETE CASCADE
);
"""


CREATE_STATUS_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_queue_alerts_status
ON queue_alerts(status);
"""


CREATE_LEVEL_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_queue_alerts_level
ON queue_alerts(alert_level);
"""


def run_migration() -> None:
    connection = sqlite3.connect(DATABASE_PATH)

    try:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute(CREATE_TABLE_SQL)
        connection.execute(CREATE_STATUS_INDEX_SQL)
        connection.execute(CREATE_LEVEL_INDEX_SQL)
        connection.commit()

        print("Stage 19 migration completed successfully.")
        print(f"Database: {DATABASE_PATH}")
        print("Table: queue_alerts")

    finally:
        connection.close()


if __name__ == "__main__":
    run_migration()