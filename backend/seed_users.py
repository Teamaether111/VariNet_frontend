"""
Seeds demo accounts so role-based login works immediately for the hackathon demo.
Run once: python seed_users.py
"""

import bcrypt
from database import init_db, get_db


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

DEMO_USERS = [
    ("POL-1024", "Inspector Deshmukh", "police", "demo1234"),
    ("VOL-2001", "Ramesh Shinde", "volunteer", "demo1234"),
    ("TMP-3001", "Temple Officer Patil", "temple-authority", "demo1234"),
    ("WAR-0001", "Sample Pilgrim", "pilgrim", "demo1234"),
]

init_db()

with get_db() as conn:
    for user_id, name, role, password in DEMO_USERS:
        existing = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if existing:
            print(f"Skipped (already exists): {user_id}")
            continue
        password_hash = hash_password(password)
        conn.execute(
            "INSERT INTO users (id, name, role, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, name, role, password_hash),
        )
        print(f"Created: {user_id} / {name} / {role} / password: {password}")
    conn.commit()

print("\nDone. Demo login credentials:")
for user_id, name, role, password in DEMO_USERS:
    print(f"  Role: {role:20s} | ID: {user_id:12s} | Name: {name:25s} | Password: {password}")
