import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "varinet.db"
SQL_PATH = (
    BASE_DIR
    / "database_files"
    / "07_create_geography_tables.sql"
)


def print_table_columns(connection, table_name):
    columns = connection.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    print(f"\n{table_name} columns:")

    for column in columns:
        print(
            f"- {column[1]} | "
            f"type={column[2]} | "
            f"required={bool(column[3])} | "
            f"primary_key={bool(column[5])}"
        )


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(
            f"Database was not found: {DB_PATH}"
        )

    if not SQL_PATH.exists():
        raise FileNotFoundError(
            f"SQL file was not found: {SQL_PATH}"
        )

    sql = SQL_PATH.read_text(encoding="utf-8")

    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(sql)

        table_names = {
            row[0]
            for row in connection.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                """
            ).fetchall()
        }

        required_tables = {"zones", "facilities"}
        missing_tables = required_tables - table_names

        if missing_tables:
            raise RuntimeError(
                f"Missing tables: {sorted(missing_tables)}"
            )

        print("Stage 7 tables created successfully.")
        print(f"Database: {DB_PATH}")

        print_table_columns(connection, "zones")
        print_table_columns(connection, "facilities")

        foreign_key_setting = connection.execute(
            "PRAGMA foreign_keys"
        ).fetchone()[0]

        print(
            "\nForeign keys enabled:",
            bool(foreign_key_setting),
        )


if __name__ == "__main__":
    main()