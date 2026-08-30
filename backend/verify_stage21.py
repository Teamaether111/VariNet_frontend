r"""VARI-Net Stage 21 automated quality gate.

Run from the backend directory:
    .\.venv\Scripts\python.exe verify_stage21.py
"""

from __future__ import annotations

import py_compile
import sqlite3
import sys
from pathlib import Path
from typing import Callable

import joblib


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "temple_queue_model.pkl"
DATABASE_PATH = BASE_DIR / "varinet.db"

passed = 0
failed = 0


def check(name: str, test: Callable[[], None]) -> None:
    global passed, failed
    try:
        test()
        passed += 1
        print(f"[PASS] {name}")
    except Exception as error:
        failed += 1
        print(f"[FAIL] {name}")
        print(f"       {type(error).__name__}: {error}")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def check_required_files() -> None:
    required_files = [
        "main.py",
        "auth.py",
        "database.py",
        "routers/temple_queue.py",
        "schemas/temple_queue.py",
        "services/temple_queue_predictor.py",
        "services/queue_decision_service.py",
        "repositories/queue_prediction_repository.py",
        "repositories/queue_alert_repository.py",
        "models/temple_queue_model.pkl",
        "varinet.db",
    ]
    missing = [name for name in required_files if not (BASE_DIR / name).exists()]
    require(not missing, f"Missing files: {missing}")


def check_python_syntax() -> None:
    python_files = [
        "main.py",
        "auth.py",
        "database.py",
        "routers/temple_queue.py",
        "schemas/temple_queue.py",
        "services/temple_queue_predictor.py",
        "services/queue_decision_service.py",
        "repositories/queue_prediction_repository.py",
        "repositories/queue_alert_repository.py",
    ]
    for relative_path in python_files:
        py_compile.compile(
            str(BASE_DIR / relative_path),
            doraise=True,
        )


def check_model_bundle() -> None:
    bundle = joblib.load(MODEL_PATH)
    require(isinstance(bundle, dict), "Model artifact must contain a dictionary")
    require("pipeline" in bundle, "Model bundle has no pipeline")
    require("feature_columns" in bundle, "Model bundle has no feature_columns")

    expected_features = {
        "hour",
        "day_of_week",
        "waiting_people",
        "gates_open",
        "crowd_count",
        "crowd_density",
        "zone_id",
        "location",
        "route_type",
        "darshan_status",
        "is_peak_day",
    }
    actual_features = set(bundle["feature_columns"])
    require(
        actual_features == expected_features,
        f"Unexpected features: {sorted(actual_features)}",
    )


def check_live_prediction() -> None:
    from services.temple_queue_predictor import predict_queue_wait

    prediction = predict_queue_wait(
        {
            "hour": 12,
            "day_of_week": 2,
            "waiting_people": 2500,
            "gates_open": 4,
            "crowd_count": 5000,
            "crowd_density": 4.2,
            "zone_id": "Z011",
            "location": "Pandharpur",
            "route_type": "Main",
            "darshan_status": "OPEN",
            "is_peak_day": True,
        }
    )
    require(isinstance(prediction, float), "Prediction must be a float")
    require(prediction >= 0, "Prediction cannot be negative")
    require(prediction < 2000, "Prediction is outside a reasonable prototype range")


def prepare_queue_tables() -> None:
    from repositories.queue_alert_repository import ensure_alert_table
    from repositories.queue_prediction_repository import ensure_prediction_table

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    try:
        ensure_prediction_table(connection)
        ensure_alert_table(connection)
    finally:
        connection.close()


def check_database_tables() -> None:
    prepare_queue_tables()
    expected_tables = {
        "users",
        "incidents",
        "zones",
        "facilities",
        "temple_queue_predictions",
        "queue_alerts",
    }
    connection = sqlite3.connect(DATABASE_PATH)
    try:
        rows = connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        ).fetchall()
        actual_tables = {row[0] for row in rows}
        missing = expected_tables - actual_tables
        require(not missing, f"Missing SQLite tables: {sorted(missing)}")
    finally:
        connection.close()


def check_prediction_columns() -> None:
    expected_columns = {
        "prediction_id",
        "prediction_date",
        "hour",
        "day_of_week",
        "zone_id",
        "location",
        "waiting_people",
        "gates_open",
        "crowd_count",
        "crowd_density",
        "route_type",
        "darshan_status",
        "is_peak_day",
        "predicted_wait_minutes",
        "predicted_wait_label",
        "requested_by",
        "created_at",
    }
    connection = sqlite3.connect(DATABASE_PATH)
    try:
        rows = connection.execute(
            "PRAGMA table_info(temple_queue_predictions)"
        ).fetchall()
        actual_columns = {row[1] for row in rows}
        missing = expected_columns - actual_columns
        require(not missing, f"Missing prediction columns: {sorted(missing)}")
    finally:
        connection.close()


def check_alert_columns() -> None:
    expected_columns = {
        "alert_id",
        "prediction_id",
        "zone_id",
        "alert_level",
        "title",
        "message",
        "explanation",
        "recommended_action",
        "status",
        "reviewed_by",
        "reviewed_at",
        "created_at",
    }
    connection = sqlite3.connect(DATABASE_PATH)
    try:
        rows = connection.execute("PRAGMA table_info(queue_alerts)").fetchall()
        actual_columns = {row[1] for row in rows}
        missing = expected_columns - actual_columns
        require(not missing, f"Missing alert columns: {sorted(missing)}")
    finally:
        connection.close()


def get_application():
    from main import app

    return app


def route_pairs() -> list[tuple[str, str]]:
    app = get_application()
    schema = app.openapi()
    pairs: list[tuple[str, str]] = []
    http_methods = {
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
        "trace",
    }
    for path, path_item in schema.get("paths", {}).items():
        for method in path_item:
            if method.lower() in http_methods:
                pairs.append((method.upper(), path))
    return pairs


def check_no_duplicate_routes() -> None:
    app = get_application()
    schema = app.openapi()
    operation_ids: list[str] = []

    for path_item in schema.get("paths", {}).values():
        for operation in path_item.values():
            if isinstance(operation, dict) and operation.get("operationId"):
                operation_ids.append(operation["operationId"])

    duplicate_ids = sorted(
        operation_id
        for operation_id in set(operation_ids)
        if operation_ids.count(operation_id) > 1
    )
    require(
        not duplicate_ids,
        f"Duplicate OpenAPI operation IDs: {duplicate_ids}",
    )


def check_required_routes() -> None:
    routes = set(route_pairs())
    required_routes = {
        ("POST", "/api/temple-queue/predict"),
        ("GET", "/api/temple-queue/history"),
        ("GET", "/api/temple-queue/alerts"),
        ("PATCH", "/api/temple-queue/alerts/{alert_id}"),
        ("POST", "/api/auth/login"),
        ("POST", "/api/auth/register"),
        ("GET", "/api/auth/me"),
        ("GET", "/api/incidents"),
        ("GET", "/api/facilities"),
    }
    missing = required_routes - routes
    require(not missing, f"Missing API routes: {sorted(missing)}")


def check_obsolete_routes_removed() -> None:
    paths = {path for _, path in route_pairs()}
    forbidden_fragments = [
        "/api/temple/queue/predict",
        "/api/temple/queue/api/temple/queue",
        "/api/api/temple",
    ]
    found = [
        fragment
        for fragment in forbidden_fragments
        if any(fragment in path for path in paths)
    ]
    require(not found, f"Obsolete route patterns remain: {found}")


def check_decision_logic() -> None:
    from services.queue_decision_service import generate_queue_decision

    base = {
        "predicted_wait_minutes": 20.0,
        "waiting_people": 500,
        "gates_open": 4,
        "crowd_density": 2.0,
        "zone_id": "Z011",
        "location": "Pandharpur",
    }
    low = generate_queue_decision(
        {**base, "predicted_wait_label": "LOW"}
    )
    high = generate_queue_decision(
        {
            **base,
            "predicted_wait_label": "HIGH",
            "predicted_wait_minutes": 90.0,
        }
    )
    require(low is None, "LOW prediction should not create an alert")
    require(high is not None, "HIGH prediction must create a decision")
    require(bool(high.get("explanation")), "Decision needs an explanation")
    require(
        bool(high.get("recommended_action")),
        "Decision needs a recommended action",
    )


def main() -> int:
    print("=" * 62)
    print("VARI-Net Stage 21 Quality Gate")
    print("=" * 62)

    checks = [
        ("Required project files", check_required_files),
        ("Python syntax", check_python_syntax),
        ("Temple queue model bundle", check_model_bundle),
        ("Live ML inference", check_live_prediction),
        ("Required SQLite tables", check_database_tables),
        ("Prediction table columns", check_prediction_columns),
        ("Alert table columns", check_alert_columns),
        ("No duplicate FastAPI routes", check_no_duplicate_routes),
        ("Required API routes", check_required_routes),
        ("Obsolete routes removed", check_obsolete_routes_removed),
        ("Explainable decision logic", check_decision_logic),
    ]

    for name, function in checks:
        check(name, function)

    print("-" * 62)
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")

    if failed:
        print("STAGE 21 RESULT: NOT READY")
        return 1

    print("STAGE 21 RESULT: BACKEND QUALITY GATE PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
