from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from auth import require_roles
from repositories.queue_alert_repository import (
    create_queue_alert,
    list_queue_alerts,
    update_queue_alert_status,
)
from repositories.queue_prediction_repository import (
    create_queue_prediction,
    list_queue_predictions,
)
from schemas.temple_queue import (
    QueueAlertStatusUpdate,
    TempleQueuePredictionRequest,
    TempleQueuePredictionResponse,
)
from services.queue_decision_service import generate_queue_decision
from services.temple_queue_predictor import predict_queue_wait


router = APIRouter(
    prefix="/temple-queue",
    tags=["Temple Queue Prediction"],
)

queue_access = require_roles("police", "temple-authority")


def get_wait_label(wait_minutes: float) -> str:
    if wait_minutes < 30:
        return "LOW"
    if wait_minutes < 60:
        return "MODERATE"
    if wait_minutes < 120:
        return "HIGH"
    return "CRITICAL"


@router.post(
    "/predict",
    response_model=TempleQueuePredictionResponse,
)
def predict_queue_wait_time(
    request: TempleQueuePredictionRequest,
    current_user: dict = Depends(queue_access),
) -> dict[str, Any]:
    try:
        day_of_week = request.date.weekday()

        features = {
            "hour": request.hour,
            "day_of_week": day_of_week,
            "waiting_people": request.waiting_people,
            "gates_open": request.gates_open,
            "crowd_count": request.crowd_count,
            "crowd_density": request.crowd_density,
            "zone_id": request.zone_id,
            "location": request.location,
            "route_type": request.route_type,
            "darshan_status": request.darshan_status,
            "is_peak_day": request.is_peak_day,
        }

        predicted_wait = predict_queue_wait(features)
        wait_label = get_wait_label(predicted_wait)

        saved_prediction = create_queue_prediction(
            {
                **features,
                "prediction_date": request.date.isoformat(),
                "predicted_wait_minutes": predicted_wait,
                "predicted_wait_label": wait_label,
                "requested_by": current_user.get("sub"),
            }
        )

        decision = generate_queue_decision(saved_prediction)
        saved_alert = None

        if decision is not None:
            saved_alert = create_queue_alert(
                prediction_id=saved_prediction["prediction_id"],
                zone_id=saved_prediction["zone_id"],
                decision=decision,
            )

        return {
            "prediction_id": saved_prediction["prediction_id"],
            "predicted_wait_minutes": saved_prediction[
                "predicted_wait_minutes"
            ],
            "predicted_wait_label": saved_prediction[
                "predicted_wait_label"
            ],
            "day_of_week": saved_prediction["day_of_week"],
            "created_at": saved_prediction["created_at"],
            "alert_created": saved_alert is not None,
            "alert_id": saved_alert["alert_id"] if saved_alert else None,
            "explanation": (
                saved_alert["explanation"] if saved_alert else None
            ),
            "recommended_action": (
                saved_alert["recommended_action"] if saved_alert else None
            ),
        }
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to predict temple queue wait time: {error}",
        ) from error


@router.get("/history")
def get_queue_prediction_history(
    zone_id: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    _: dict = Depends(queue_access),
) -> dict[str, Any]:
    records = list_queue_predictions(zone_id=zone_id, limit=limit)
    return {"count": len(records), "items": records}


@router.get("/alerts")
def get_queue_alerts(
    alert_status: Optional[str] = Query(default=None, alias="status"),
    zone_id: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    _: dict = Depends(queue_access),
) -> dict[str, Any]:
    allowed_statuses = {
        "PENDING",
        "APPROVED",
        "REJECTED",
        "RESOLVED",
    }

    normalized_status = alert_status.upper() if alert_status else None
    if normalized_status and normalized_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid queue alert status.",
        )

    alerts = list_queue_alerts(
        status=normalized_status,
        zone_id=zone_id,
        limit=limit,
    )
    return {"count": len(alerts), "items": alerts}


@router.patch("/alerts/{alert_id}")
def review_queue_alert(
    alert_id: int,
    update: QueueAlertStatusUpdate,
    current_user: dict = Depends(queue_access),
) -> dict[str, Any]:
    updated_alert = update_queue_alert_status(
        alert_id=alert_id,
        new_status=update.status,
        reviewed_by=current_user.get("sub"),
    )

    if updated_alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue alert not found.",
        )

    return updated_alert
