from typing import Optional

from database import get_db


def facility_to_payload(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "type": row["facility_type"],
        "zoneId": row["zone_id"],
        "coordinates": {
            "x": 0,
            "y": 0,
        },
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "capacity": row["capacity"],
        "currentAvailability": row["current_availability"],
        "status": row["status"],
        "contactNumber": row["contact_number"],
    }


def list_facilities(
    zone_id: Optional[str] = None,
    facility_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 500,
) -> list[dict]:
    query = """
        SELECT
            id,
            zone_id,
            name,
            facility_type,
            latitude,
            longitude,
            capacity,
            current_availability,
            status,
            contact_number
        FROM facilities
        WHERE 1 = 1
    """

    parameters = []

    if zone_id:
        query += " AND zone_id = ?"
        parameters.append(zone_id.strip().upper())

    if facility_type:
        query += " AND UPPER(facility_type) = ?"
        parameters.append(facility_type.strip().upper())

    if status:
        query += " AND UPPER(status) = ?"
        parameters.append(status.strip().upper())

    query += " ORDER BY name ASC LIMIT ?"
    parameters.append(limit)

    with get_db() as connection:
        rows = connection.execute(query, parameters).fetchall()

    return [facility_to_payload(row) for row in rows]


def get_facility_by_id(facility_id: str) -> Optional[dict]:
    query = """
        SELECT
            id,
            zone_id,
            name,
            facility_type,
            latitude,
            longitude,
            capacity,
            current_availability,
            status,
            contact_number
        FROM facilities
        WHERE id = ?
    """

    with get_db() as connection:
        row = connection.execute(
            query,
            (facility_id.strip().upper(),),
        ).fetchone()

    if row is None:
        return None

    return facility_to_payload(row)