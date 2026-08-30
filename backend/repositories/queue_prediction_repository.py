import sqlite3
from pathlib import Path
from typing import Any, Optional


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "varinet.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {column: row[column] for column in row.keys()}


def ensure_prediction_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS temple_queue_predictions (
            prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            zone_id TEXT NOT NULL,
            prediction_date TEXT NOT NULL,
            hour INTEGER NOT NULL,
            day_of_week INTEGER NOT NULL,
            location TEXT NOT NULL,
            waiting_people INTEGER DEFAULT 0,
            gates_open INTEGER DEFAULT 1,
            crowd_count INTEGER DEFAULT 0,
            crowd_density REAL DEFAULT 0,
            route_type TEXT DEFAULT '',
            darshan_status TEXT DEFAULT 'OPEN',
            is_peak_day INTEGER DEFAULT 0,
            requested_by TEXT,
            predicted_wait_minutes REAL NOT NULL,
            predicted_wait_label TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    existing_columns = {
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(temple_queue_predictions)"
        ).fetchall()
    }

    additional_columns = {
        "crowd_count": "INTEGER DEFAULT 0",
        "route_type": "TEXT DEFAULT ''",
        "darshan_status": "TEXT DEFAULT 'OPEN'",
        "is_peak_day": "INTEGER DEFAULT 0",
        "requested_by": "TEXT",
    }

    for column_name, column_definition in additional_columns.items():
        if column_name not in existing_columns:
            connection.execute(
                f"ALTER TABLE temple_queue_predictions "
                f"ADD COLUMN {column_name} {column_definition}"
            )

    connection.commit()


def create_queue_prediction(data: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        ensure_prediction_table(connection)
        cursor = connection.execute(
            """
            INSERT INTO temple_queue_predictions (
                zone_id,
                prediction_date,
                hour,
                day_of_week,
                location,
                waiting_people,
                gates_open,
                crowd_count,
                crowd_density,
                route_type,
                darshan_status,
                is_peak_day,
                requested_by,
                predicted_wait_minutes,
                predicted_wait_label
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["zone_id"],
                data["prediction_date"],
                data["hour"],
                data["day_of_week"],
                data["location"],
                data["waiting_people"],
                data["gates_open"],
                data["crowd_count"],
                data["crowd_density"],
                data["route_type"],
                data["darshan_status"],
                int(data["is_peak_day"]),
                data.get("requested_by"),
                data["predicted_wait_minutes"],
                data["predicted_wait_label"],
            ),
        )
        connection.commit()

        row = connection.execute(
            """
            SELECT * FROM temple_queue_predictions
            WHERE prediction_id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

        if row is None:
            raise RuntimeError("Saved prediction could not be retrieved.")
        return row_to_dict(row)
    finally:
        connection.close()


def list_queue_predictions(
    zone_id: Optional[str] = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        ensure_prediction_table(connection)
        if zone_id:
            rows = connection.execute(
                """
                SELECT * FROM temple_queue_predictions
                WHERE zone_id = ?
                ORDER BY prediction_id DESC
                LIMIT ?
                """,
                (zone_id, limit),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT * FROM temple_queue_predictions
                ORDER BY prediction_id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [row_to_dict(row) for row in rows]
    finally:
        connection.close()
