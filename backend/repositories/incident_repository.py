import json
import uuid
from typing import Optional

from database import get_db


VALID_STATUSES = {
    "NEW",
    "ACKNOWLEDGED",
    "IN_PROGRESS",
    "RESOLVED",
}


def serialize_incident(row) -> dict:
    assigned_units = []

    if row["assigned_units_json"]:
        try:
            assigned_units = json.loads(
                row["assigned_units_json"]
            )
        except json.JSONDecodeError:
            assigned_units = []

    return {
        "id": row["id"],
        "type": row["type"],
        "title": row["title"],
        "description": row["description"] or "",
        "zoneId": row["zone_id"],
        "zoneName": row["zone_name"] or row["zone_id"],
        "priority": row["priority"],
        "status": row["status"],
        "reportedBy": row["reported_by"],
        "reportedRole": row["reported_role"],
        "timestamp": row["created_at"],
        "locationDetails": row["location_details"] or "",
        "coordinates": {
            "x": row["coord_x"] or 0,
            "y": row["coord_y"] or 0,
        },
        "assignedTo": row["assigned_to"],
        "assignedUnits": assigned_units,
        "evidenceUrl": row["evidence_url"],
        "audioNote": row["audio_note"],
        "resolvedAt": row["resolved_at"],
    }


def list_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    zone_id: Optional[str] = None,
) -> list[dict]:
    query = """
        SELECT *
        FROM incidents
        WHERE 1 = 1
    """

    parameters = []

    if status:
        query += " AND status = ?"
        parameters.append(status.upper())

    if priority:
        query += " AND priority = ?"
        parameters.append(priority.upper())

    if zone_id:
        query += " AND zone_id = ?"
        parameters.append(zone_id)

    query += " ORDER BY created_at DESC"

    with get_db() as connection:
        rows = connection.execute(
            query,
            parameters,
        ).fetchall()

    return [
        serialize_incident(row)
        for row in rows
    ]


def get_incident_by_id(
    incident_id: str,
) -> Optional[dict]:
    with get_db() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM incidents
            WHERE id = ?
            """,
            (incident_id,),
        ).fetchone()

    if row is None:
        return None

    return serialize_incident(row)


def create_incident(data: dict) -> dict:
    incident_id = (
        f"inc-{uuid.uuid4().hex[:8]}"
    )

    coordinates = data.get("coordinates") or {}

    with get_db() as connection:
        connection.execute(
            """
            INSERT INTO incidents (
                id,
                type,
                title,
                description,
                zone_id,
                zone_name,
                priority,
                status,
                reported_by,
                reported_role,
                location_details,
                coord_x,
                coord_y,
                evidence_url,
                audio_note
            )
            VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                'NEW', ?, ?, ?, ?, ?, ?, ?
            )
            """,
            (
                incident_id,
                data["type"],
                data["title"],
                data.get("description", ""),
                data["zoneId"],
                data.get("zoneName", data["zoneId"]),
                data["priority"],
                data["reportedBy"],
                data["reportedRole"],
                data.get("locationDetails", ""),
                coordinates.get("x", 0),
                coordinates.get("y", 0),
                data.get("evidenceUrl"),
                data.get("audioNote"),
            ),
        )

        connection.commit()

        row = connection.execute(
            """
            SELECT *
            FROM incidents
            WHERE id = ?
            """,
            (incident_id,),
        ).fetchone()

    return serialize_incident(row)


def update_incident(
    incident_id: str,
    status: str,
    assigned_units: Optional[list[str]] = None,
) -> Optional[dict]:
    normalized_status = status.upper()

    if normalized_status not in VALID_STATUSES:
        raise ValueError(
            f"Invalid incident status: {status}"
        )

    assigned_to = None
    assigned_units_json = None

    if assigned_units is not None:
        assigned_to = ", ".join(assigned_units)
        assigned_units_json = json.dumps(
            assigned_units
        )

    with get_db() as connection:
        existing = connection.execute(
            """
            SELECT id
            FROM incidents
            WHERE id = ?
            """,
            (incident_id,),
        ).fetchone()

        if existing is None:
            return None

        if assigned_units is None:
            connection.execute(
                """
                UPDATE incidents
                SET
                    status = ?,
                    resolved_at = CASE
                        WHEN ? = 'RESOLVED'
                        THEN CURRENT_TIMESTAMP
                        ELSE resolved_at
                    END
                WHERE id = ?
                """,
                (
                    normalized_status,
                    normalized_status,
                    incident_id,
                ),
            )
        else:
            connection.execute(
                """
                UPDATE incidents
                SET
                    status = ?,
                    assigned_to = ?,
                    assigned_units_json = ?,
                    resolved_at = CASE
                        WHEN ? = 'RESOLVED'
                        THEN CURRENT_TIMESTAMP
                        ELSE resolved_at
                    END
                WHERE id = ?
                """,
                (
                    normalized_status,
                    assigned_to,
                    assigned_units_json,
                    normalized_status,
                    incident_id,
                ),
            )

        connection.commit()

        row = connection.execute(
            """
            SELECT *
            FROM incidents
            WHERE id = ?
            """,
            (incident_id,),
        ).fetchone()

    return serialize_incident(row)