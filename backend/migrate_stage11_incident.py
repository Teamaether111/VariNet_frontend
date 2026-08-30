import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "varinet.db"


def add_column_if_missing(
    connection,
    table_name: str,
    column_name: str,
    column_definition: str,
):
    existing_columns = {
        row[1]
        for row in connection.execute(
            f"PRAGMA table_info({table_name})"
        ).fetchall()
    }

    if column_name not in existing_columns:
        connection.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name}
            {column_definition}
            """
        )

        print(f"Added column: {column_name}")
    else:
        print(f"Column already exists: {column_name}")


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(
            f"Database not found: {DB_PATH}"
        )

    with sqlite3.connect(DB_PATH) as connection:
        add_column_if_missing(
            connection,
            "incidents",
            "assigned_to",
            "TEXT",
        )

        add_column_if_missing(
            connection,
            "incidents",
            "assigned_units_json",
            "TEXT",
        )

        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_incidents_status_priority
            ON incidents(status, priority)
            """
        )

        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_incidents_zone_created
            ON incidents(zone_id, created_at)
            """
        )

        connection.commit()

    print("Stage 11 incident migration completed.")


if __name__ == "__main__":
    main()