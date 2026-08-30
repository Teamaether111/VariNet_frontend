import sqlite3
from pathlib import Path
from typing import Any, Optional


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "varinet.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        column: row[column]
        for column in row.keys()
    }


def create_queue_prediction(
    prediction: dict[str, Any],
) -> dict[str, Any]:
    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO temple_queue_predictions (
                prediction_date,
                hour,
                zone_id,
                location,
                route_type,
                waiting_people,
                gates_open,
                crowd_count,
                crowd_density,
                darshan_status,
                is_peak_day,
                day_of_week,
                predicted_wait_minutes,
                predicted_wait_label,
                requested_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                prediction["prediction_date"],
                prediction["hour"],
                prediction["zone_id"],
                prediction["location"],
                prediction["route_type"],
                prediction["waiting_people"],
                prediction["gates_open"],
                prediction["crowd_count"],
                prediction["crowd_density"],
                prediction["darshan_status"],
                int(prediction["is_peak_day"]),
                prediction["day_of_week"],
                prediction["predicted_wait_minutes"],
                prediction["predicted_wait_label"],
                prediction.get("requested_by"),
            ),
        )

        connection.commit()

        saved_row = connection.execute(
            """
            SELECT *
            FROM temple_queue_predictions
            WHERE prediction_id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

        if saved_row is None:
            raise RuntimeError(
                "Prediction was inserted but could not be retrieved."
            )

        return row_to_dict(saved_row)

    finally:
        connection.close()


def list_queue_predictions(
    zone_id: Optional[str] = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    connection = get_connection()

    try:
        if zone_id:
            rows = connection.execute(
                """
                SELECT *
                FROM temple_queue_predictions
                WHERE zone_id = ?
                ORDER BY prediction_id DESC
                LIMIT ?
                """,
                (zone_id, limit),
            ).fetchall()

        else:
            rows = connection.execute(
                """
                SELECT *
                FROM temple_queue_predictions
                ORDER BY prediction_id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        return [row_to_dict(row) for row in rows]

    finally:
        connection.close()