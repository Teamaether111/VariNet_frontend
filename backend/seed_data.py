import csv
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "varinet.db"
ZONES_CSV = BASE_DIR / "data" / "zones.csv"
FACILITIES_CSV = BASE_DIR / "data" / "facilities.csv"


def to_integer(value, default=0):
    if value is None or value.strip() == "":
        return default
    return int(float(value))


def to_float(value):
    if value is None or value.strip() == "":
        return None
    return float(value)


def seed_zones(connection):
    with open(ZONES_CSV, "r", encoding="utf-8-sig") as file:
        rows = csv.DictReader(file)

        for row in rows:
            connection.execute("""
                INSERT OR IGNORE INTO zones (
                    id,
                    name,
                    description,
                    capacity,
                    latitude,
                    longitude,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                row["id"],
                row["name"],
                row.get("description", ""),
                to_integer(row.get("capacity")),
                to_float(row.get("latitude")),
                to_float(row.get("longitude")),
                row.get("status") or "ACTIVE",
            ))


def seed_facilities(connection):
    valid_zone_ids = {
        row[0]
        for row in connection.execute("SELECT id FROM zones").fetchall()
    }

    with open(FACILITIES_CSV, "r", encoding="utf-8-sig") as file:
        rows = csv.DictReader(file)

        for row_number, row in enumerate(rows, start=2):
            zone_id = row["zone_id"]

            if zone_id not in valid_zone_ids:
                raise ValueError(
                    f"Invalid zone_id '{zone_id}' in facilities.csv "
                    f"at row {row_number}"
                )

            connection.execute("""
                INSERT OR IGNORE INTO facilities (
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
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["id"],
                zone_id,
                row["name"],
                row["facility_type"],
                to_float(row.get("latitude")),
                to_float(row.get("longitude")),
                to_integer(row.get("capacity")),
                to_integer(row.get("current_availability")),
                row.get("status") or "AVAILABLE",
                row.get("contact_number", ""),
            ))


def main():
    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        # Required order
        seed_zones(connection)
        connection.commit()

        seed_facilities(connection)
        connection.commit()

        zone_count = connection.execute(
            "SELECT COUNT(*) FROM zones"
        ).fetchone()[0]

        facility_count = connection.execute(
            "SELECT COUNT(*) FROM facilities"
        ).fetchone()[0]

        print(f"Zones inserted: {zone_count}")
        print(f"Facilities inserted: {facility_count}")

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    main()