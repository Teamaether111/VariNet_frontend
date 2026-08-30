import sqlite3
from datetime import datetime, timezone
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


def ensure_alert_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
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
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (prediction_id)
                REFERENCES temple_queue_predictions(prediction_id)
                ON DELETE CASCADE
        )
        """
    )
    connection.commit()


def create_queue_alert(
    prediction_id: int,
    zone_id: str,
    decision: dict[str, str],
) -> dict[str, Any]:
    connection = get_connection()
    try:
        ensure_alert_table(connection)
        cursor = connection.execute(
            """
            INSERT INTO queue_alerts (
                prediction_id, zone_id, alert_level, title, message,
                explanation, recommended_action
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                prediction_id,
                zone_id,
                decision["alert_level"],
                decision["title"],
                decision["message"],
                decision["explanation"],
                decision["recommended_action"],
            ),
        )
        connection.commit()
        row = connection.execute(
            "SELECT * FROM queue_alerts WHERE alert_id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        if row is None:
            raise RuntimeError("Created alert could not be retrieved.")
        return row_to_dict(row)
    finally:
        connection.close()


def list_queue_alerts(
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        ensure_alert_table(connection)
        query = """
            SELECT qa.*, tp.predicted_wait_minutes, tp.prediction_date,
                   tp.hour, tp.location, tp.waiting_people,
                   tp.gates_open, tp.crowd_density
            FROM queue_alerts AS qa
            JOIN temple_queue_predictions AS tp
              ON tp.prediction_id = qa.prediction_id
            WHERE 1 = 1
        """
        parameters: list[Any] = []
        if status:
            query += " AND qa.status = ?"
            parameters.append(status.upper())
        if zone_id:
            query += " AND qa.zone_id = ?"
            parameters.append(zone_id)
        query += """
            ORDER BY
                CASE qa.alert_level
                    WHEN 'CRITICAL' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MODERATE' THEN 3
                    ELSE 4
                END,
                qa.alert_id DESC
            LIMIT ?
        """
        parameters.append(limit)
        rows = connection.execute(query, parameters).fetchall()
        return [row_to_dict(row) for row in rows]
    finally:
        connection.close()


def update_queue_alert_status(
    alert_id: int,
    new_status: str,
    reviewed_by: Optional[str],
) -> Optional[dict[str, Any]]:
    connection = get_connection()
    try:
        ensure_alert_table(connection)
        cursor = connection.execute(
            """
            UPDATE queue_alerts
            SET status = ?, reviewed_by = ?, reviewed_at = ?
            WHERE alert_id = ?
            """,
            (
                new_status,
                reviewed_by,
                datetime.now(timezone.utc).isoformat(),
                alert_id,
            ),
        )
        if cursor.rowcount == 0:
            return None
        connection.commit()
        row = connection.execute(
            "SELECT * FROM queue_alerts WHERE alert_id = ?",
            (alert_id,),
        ).fetchone()
        return row_to_dict(row) if row else None
    finally:
        connection.close()
