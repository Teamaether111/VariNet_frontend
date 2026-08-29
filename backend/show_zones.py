import sqlite3
from pathlib import Path

database = Path(__file__).resolve().parent / "varinet.db"
connection = sqlite3.connect(database)

connection.execute(
    "DELETE FROM zones WHERE id = ? AND name = ?",
    ("ZONE-001", "Temple Entrance"),
)

connection.commit()
print("Sample zone removed.")
connection.close()