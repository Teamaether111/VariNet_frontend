import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "varinet.db"

ZONES_SQL_PATH = BASE_DIR / "seed_sql" / "01_zones.sql"
FACILITIES_SQL_PATH = BASE_DIR / "seed_sql" / "02_facilities.sql"


def read_sql_file(file_path: Path) -> str:
    if not file_path.exists():
        raise FileNotFoundError(f"SQL file not found: {file_path}")

    return file_path.read_text(encoding="utf-8-sig")


def main():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        print("Step 1: Inserting zones...")

        zones_sql = read_sql_file(ZONES_SQL_PATH)
        connection.executescript(zones_sql)

        zone_count = connection.execute(
            "SELECT COUNT(*) FROM zones"
        ).fetchone()[0]

        print(f"Zones currently stored: {zone_count}")

        if zone_count != 23:
            raise ValueError(
                f"Expected 23 zones, but database contains {zone_count}. "
                "Facilities were not inserted."
            )

        print("Step 2: Inserting facilities...")

        facilities_sql = read_sql_file(FACILITIES_SQL_PATH)
        connection.executescript(facilities_sql)

        facility_count = connection.execute(
            "SELECT COUNT(*) FROM facilities"
        ).fetchone()[0]

        invalid_facilities = connection.execute("""
            SELECT COUNT(*)
            FROM facilities AS f
            LEFT JOIN zones AS z ON z.id = f.zone_id
            WHERE f.zone_id IS NOT NULL
              AND z.id IS NULL
        """).fetchone()[0]

        if facility_count != 432:
            raise ValueError(
                f"Expected 432 facilities, but database contains "
                f"{facility_count}."
            )

        if invalid_facilities != 0:
            raise ValueError(
                f"{invalid_facilities} facilities contain invalid zone IDs."
            )

        connection.commit()

        print("Database seeding completed successfully.")
        print(f"Zones: {zone_count}/23")
        print(f"Facilities: {facility_count}/432")
        print("Invalid facility zone IDs: 0")

    except Exception as error:
        connection.rollback()
        print(f"Seeding failed: {error}")
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    main()