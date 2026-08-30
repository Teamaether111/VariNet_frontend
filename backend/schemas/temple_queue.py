from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field


class TempleQueuePredictionRequest(BaseModel):
    date: date
    hour: int = Field(ge=0, le=23)
    waiting_people: int = Field(ge=0)
    gates_open: int = Field(ge=1)
    crowd_count: int = Field(ge=0)
    crowd_density: float = Field(ge=0)
    zone_id: str
    location: str
    route_type: str
    darshan_status: str
    is_peak_day: bool


class TempleQueuePredictionResponse(BaseModel):
    prediction_id: int
    predicted_wait_minutes: float
    predicted_wait_label: str
    day_of_week: int
    created_at: str
    alert_created: bool = False
    alert_id: Optional[int] = None
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None


class QueueAlertStatusUpdate(BaseModel):
    status: Literal["APPROVED", "REJECTED", "RESOLVED"]


class QueueAlertResponse(BaseModel):
    alert_id: int
    prediction_id: int
    zone_id: str
    alert_level: str
    title: str
    message: str
    explanation: str
    recommended_action: str
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str
