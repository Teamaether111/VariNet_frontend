"""
VARI-Net Authentication
Handles registration, login, password hashing (bcrypt), and JWT tokens.
"""

import datetime
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel

from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

SECRET_KEY = "vari-net-hackathon-secret-change-in-production"  # move to env var for real deployment
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

VALID_ROLES = {"pilgrim", "volunteer", "police", "temple-authority"}


class RegisterIn(BaseModel):
    id: str
    name: str
    role: str
    password: str


class LoginIn(BaseModel):
    userId: str
    name: str
    pin: str
    role: str


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session token")


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency to protect endpoints - reads 'Authorization: Bearer <token>' header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    return decode_token(token)


@router.post("/register")
def register(payload: RegisterIn):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    if len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")

    user_id = payload.id.strip().upper()
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="User ID already registered")

        password_hash = hash_password(payload.password)
        conn.execute(
            "INSERT INTO users (id, name, role, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, payload.name.strip(), payload.role, password_hash),
        )
        conn.commit()

    token = create_token(user_id, payload.role)
    return {
        "token": token,
        "user": {"id": user_id, "name": payload.name.strip(), "role": payload.role},
    }


@router.post("/login")
def login(payload: LoginIn):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    user_id = payload.userId.strip().upper()
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    if not row or not verify_password(payload.pin, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid User ID or Password")

    if row["role"] != payload.role:
        raise HTTPException(status_code=401, detail="Role does not match this User ID")

    token = create_token(row["id"], row["role"])
    return {
        "token": token,
        "user": {"id": row["id"], "name": row["name"], "role": row["role"]},
    }


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    with get_db() as conn:
        row = conn.execute("SELECT id, name, role FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(row)
