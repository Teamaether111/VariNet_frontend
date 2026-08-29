import sqlite3
from pathlib import Path

database_path = Path(__file__).resolve().parent / "varinet.db"
connection = sqlite3.connect(database_path)

zone_count = connection.execute(
    "SELECT COUNT(*) FROM zones"
).fetchone()[0]

facility_count = connection.execute(
    "SELECT COUNT(*) FROM facilities"
).fetchone()[0]

invalid_facilities = connection.execute("""
    SELECT COUNT(*)
    FROM facilities AS f
    LEFT JOIN zones AS z ON f.zone_id = z.id
    WHERE f.zone_id IS NOT NULL
      AND z.id IS NULL
""").fetchone()[0]

print(f"Zones inserted: {zone_count}/23")
print(f"Facilities inserted: {facility_count}/432")
print(f"Facilities with invalid zone_id: {invalid_facilities}")

connection.close()