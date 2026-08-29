import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "varinet.db"

ZONE_SEED_PATH = (
    BASE_DIR
    / "database_files"
    / "seed"
    / "01_seed_zones.sql"
)

FACILITY_SEED_PATH = (
    BASE_DIR
    / "database_files"
    / "seed"
    / "02_seed_facilities.sql"
)

EXPECTED_ZONE_COUNT = 23
EXPECTED_FACILITY_COUNT = 432


def verify_files():
    required_files = [
        DB_PATH,
        ZONE_SEED_PATH,
        FACILITY_SEED_PATH,
    ]

    for file_path in required_files:
        if not file_path.exists():
            raise FileNotFoundError(
                f"Required file was not found:\n{file_path}"
            )


def table_exists(connection, table_name):
    result = connection.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        """,
        (table_name,),
    ).fetchone()

    return result is not None


def read_sql(file_path):
    return file_path.read_text(encoding="utf-8")


def make_facility_seed_idempotent(sql):
    return sql.replace(
        "INSERT INTO facilities",
        "INSERT OR IGNORE INTO facilities",
    )


def print_zone_summary(connection):
    print("\nZone summary:")

    rows = connection.execute(
        """
        SELECT zone_scope, COUNT(*) AS total
        FROM zones
        GROUP BY zone_scope
        ORDER BY zone_scope
        """
    ).fetchall()

    for zone_scope, total in rows:
        print(f"- {zone_scope}: {total}")


def print_facility_summary(connection):
    print("\nFacility summary:")

    rows = connection.execute(
        """
        SELECT facility_type, COUNT(*) AS total
        FROM facilities
        GROUP BY facility_type
        ORDER BY facility_type
        """
    ).fetchall()

    for facility_type, total in rows:
        print(f"- {facility_type}: {total}")


def main():
    verify_files()

    print(f"Using database:\n{DB_PATH}")
    print(f"\nZone seed:\n{ZONE_SEED_PATH}")
    print(f"\nFacility seed:\n{FACILITY_SEED_PATH}")

    zone_sql = read_sql(ZONE_SEED_PATH)
    facility_sql = read_sql(FACILITY_SEED_PATH)
    facility_sql = make_facility_seed_idempotent(
        facility_sql
    )

    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("PRAGMA foreign_keys = ON")

        if not table_exists(connection, "zones"):
            raise RuntimeError(
                "The zones table does not exist. "
                "Complete Stage 7 first."
            )

        if not table_exists(connection, "facilities"):
            raise RuntimeError(
                "The facilities table does not exist. "
                "Complete Stage 7 first."
            )

        print("\nInserting missing zones...")
        connection.executescript(zone_sql)

        zone_count = connection.execute(
            "SELECT COUNT(*) FROM zones"
        ).fetchone()[0]

        print(f"Zones after seeding: {zone_count}")

        if zone_count != EXPECTED_ZONE_COUNT:
            zone_ids = connection.execute(
                """
                SELECT zone_id, code, name, zone_scope
                FROM zones
                ORDER BY zone_id
                """
            ).fetchall()

            print("\nZones currently available:")

            for row in zone_ids:
                print(
                    f"- {row[0]} | {row[1]} | "
                    f"{row[2]} | {row[3]}"
                )

            raise ValueError(
                f"Expected {EXPECTED_ZONE_COUNT} zones, "
                f"but database contains {zone_count}. "
                "Facilities were not inserted."
            )

        print("Inserting missing facilities...")
        connection.executescript(facility_sql)

        facility_count = connection.execute(
            "SELECT COUNT(*) FROM facilities"
        ).fetchone()[0]

        orphan_count = connection.execute(
            """
            SELECT COUNT(*)
            FROM facilities AS facility
            LEFT JOIN zones AS zone
              ON zone.zone_id = facility.zone_id
            WHERE zone.zone_id IS NULL
            """
        ).fetchone()[0]

        foreign_key_errors = connection.execute(
            "PRAGMA foreign_key_check"
        ).fetchall()

        print("\nFinal validation")
        print("----------------")
        print(f"Zones: {zone_count}")
        print(f"Facilities: {facility_count}")
        print(f"Orphan facilities: {orphan_count}")
        print(
            f"Foreign-key errors: "
            f"{foreign_key_errors}"
        )

        print_zone_summary(connection)
        print_facility_summary(connection)

        if facility_count != EXPECTED_FACILITY_COUNT:
            raise ValueError(
                f"Expected {EXPECTED_FACILITY_COUNT} "
                f"facilities, but database contains "
                f"{facility_count}."
            )

        if orphan_count != 0:
            raise ValueError(
                f"Found {orphan_count} orphan facilities."
            )

        if foreign_key_errors:
            raise ValueError(
                "SQLite reported foreign-key errors."
            )

        connection.commit()

    print("\nStage 8 completed successfully.")
    print("The database contains 23 zones and 432 facilities.")


if __name__ == "__main__":
    main()