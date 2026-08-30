"""VARI-Net authentication with bcrypt passwords and JWT tokens."""

import datetime
import os
from pathlib import Path
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel

from database import get_db


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "development-only-change-this-secret",
)
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
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


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"), password_hash.encode("utf-8")
    )


def create_token(user_id: str, role: str) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError as error:
        raise HTTPException(
            status_code=401,
            detail="Session expired, please log in again",
        ) from error
    except jwt.InvalidTokenError as error:
        raise HTTPException(
            status_code=401,
            detail="Invalid session token",
        ) from error


def get_current_user(
    authorization: Optional[str] = Header(default=None),
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_token(authorization.split(" ", 1)[1])


def require_roles(*allowed_roles: str):
    def role_guard(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return role_guard


@router.post("/register")
def register(payload: RegisterIn):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    if len(payload.password) < 4:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 4 characters",
        )

    user_id = payload.id.strip().upper()
    with get_db() as connection:
        existing = connection.execute(
            "SELECT id FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=409,
                detail="User ID already registered",
            )
        connection.execute(
            "INSERT INTO users (id, name, role, password_hash) "
            "VALUES (?, ?, ?, ?)",
            (
                user_id,
                payload.name.strip(),
                payload.role,
                hash_password(payload.password),
            ),
        )
        connection.commit()

    return {
        "token": create_token(user_id, payload.role),
        "user": {
            "id": user_id,
            "name": payload.name.strip(),
            "role": payload.role,
        },
    }


@router.post("/login")
def login(payload: LoginIn):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    user_id = payload.userId.strip().upper()
    with get_db() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()

    if not row or not verify_password(payload.pin, row["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid User ID or Password",
        )
    if row["role"] != payload.role:
        raise HTTPException(
            status_code=401,
            detail="Role does not match this User ID",
        )

    return {
        "token": create_token(row["id"], row["role"]),
        "user": {
            "id": row["id"],
            "name": row["name"],
            "role": row["role"],
        },
    }


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    with get_db() as connection:
        row = connection.execute(
            "SELECT id, name, role FROM users WHERE id = ?",
            (current_user["sub"],),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(row)
