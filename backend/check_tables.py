import sqlite3

connection = sqlite3.connect("varinet.db")

cursor = connection.execute(
    "SELECT name FROM sqlite_master WHERE type = ? ORDER BY name",
    ("table",),
)

tables = [row[0] for row in cursor.fetchall()]

print("Tables found:")
for table in tables:
    print(f" - {table}")

connection.close()