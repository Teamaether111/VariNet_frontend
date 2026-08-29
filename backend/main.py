"""
VARI-Net FastAPI Backend
Serves live crowd-risk predictions and operational APIs to the React frontend.
"""

import datetime
import random
from pathlib import Path
from typing import List, Optional

import joblib
import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import get_current_user, require_roles, router as auth_router
from database import get_db, init_db
from repositories.facility_repository import (
    get_facility_by_id,
    list_facilities,
)
from repositories.incident_repository import (
    create_incident as db_create_incident,
    get_incident_by_id as db_get_incident,
    list_incidents as db_list_incidents,
    update_incident as db_update_incident,
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

app = FastAPI(title="VARI-Net Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Only auth is a separate router.
# Do NOT include incidents_router or facilities_router here.
app.include_router(auth_router)

init_db()

# ---------------------------------------------------------------------------
# Load trained ML model and encoders
# ---------------------------------------------------------------------------

rf_model = joblib.load(MODEL_DIR / "crowd_density_model.pkl")
zone_encoder = joblib.load(MODEL_DIR / "zone_encoder.pkl")
location_encoder = joblib.load(MODEL_DIR / "location_encoder.pkl")
route_encoder = joblib.load(MODEL_DIR / "route_encoder.pkl")
timeslot_encoder = joblib.load(MODEL_DIR / "timeslot_encoder.pkl")
peakday_encoder = joblib.load(MODEL_DIR / "peakday_encoder.pkl")

SECTOR_MAP = {
    "sector-a": {
        "code": "Sector A",
        "name": "Chandrabhaga Holy Ghats",
        "zone_id": "Z009",
        "location": "Dehu",
        "route_type": "Main",
        "maxSafeCapacity": 85000,
    },
    "sector-b": {
        "code": "Sector B",
        "name": "Vitthal Temple Quad & Mahadwar",
        "zone_id": "Z003",
        "location": "Alandi",
        "route_type": "Main",
        "maxSafeCapacity": 50000,
    },
    "sector-c": {
        "code": "Sector C",
        "name": "Palkhi Marg & VIP Junction",
        "zone_id": "Z020",
        "location": "Pune City",
        "route_type": "Tukaram",
        "maxSafeCapacity": 70000,
    },
    "sector-d": {
        "code": "Sector D",
        "name": "Namdev Gate & East Approach",
        "zone_id": "Z017",
        "location": "Pandharpur",
        "route_type": "Main",
        "maxSafeCapacity": 60000,
    },
    "sector-e": {
        "code": "Sector E",
        "name": "Outer Camp & Parking Belt",
        "zone_id": "Z013",
        "location": "Loni Kalbhor",
        "route_type": "Tukaram",
        "maxSafeCapacity": 45000,
    },
}

WEATHER_CONDITIONS = [
    "Sunny",
    "Humid & Overcast",
    "Hot & Dry",
    "Scattered Showers",
]


def get_time_slot(hour: int) -> str:
    if 5 <= hour < 12:
        return "Morning"
    if 12 <= hour < 17:
        return "Afternoon"
    if 17 <= hour < 21:
        return "Evening"
    return "Night"


def density_to_risk_level(density: float) -> str:
    if density >= 90:
        return "CRITICAL"
    if density >= 70:
        return "HIGH"
    if density >= 40:
        return "MEDIUM"
    return "LOW"


def heat_risk_from_temp(temp: float) -> str:
    if temp >= 38:
        return "Extreme"
    if temp >= 34:
        return "High"
    if temp >= 28:
        return "Moderate"
    return "Low"


def predict_sector_density(
    zone_id: str,
    location: str,
    route_type: str,
    hour: int,
    is_peak_day: str,
    temperature_c: float,
    humidity_percent: float,
    precipitation_mm: float,
    wind_speed_kmh: float,
) -> float:
    time_slot = get_time_slot(hour)

    input_df = pd.DataFrame(
        [{
            "hour": hour,
            "zone_id_enc": zone_encoder.transform([zone_id])[0],
            "location_enc": location_encoder.transform([location])[0],
            "route_type_enc": route_encoder.transform([route_type])[0],
            "time_slot_enc": timeslot_encoder.transform([time_slot])[0],
            "is_peak_day_enc": peakday_encoder.transform([is_peak_day])[0],
            "temperature_c": temperature_c,
            "humidity_percent": humidity_percent,
            "precipitation_mm": precipitation_mm,
            "wind_speed_kmh": wind_speed_kmh,
        }]
    )

    density = float(rf_model.predict(input_df)[0])
    return max(0, min(100, density))


def build_zone_payload(sector_id: str) -> dict:
    info = SECTOR_MAP[sector_id]
    now = datetime.datetime.now()

    temperature_c = round(random.uniform(26, 38), 1)
    humidity_percent = round(random.uniform(45, 90), 1)
    precipitation_mm = round(random.uniform(0, 15), 1)
    wind_speed_kmh = round(random.uniform(5, 30), 1)

    density = predict_sector_density(
        info["zone_id"],
        info["location"],
        info["route_type"],
        now.hour,
        "Yes" if now.weekday() >= 5 else "No",
        temperature_c,
        humidity_percent,
        precipitation_mm,
        wind_speed_kmh,
    )

    risk_level = density_to_risk_level(density)

    status_map = {
        "LOW": "NORMAL",
        "MEDIUM": "MONITORING",
        "HIGH": "INTERVENTION_REQUIRED",
        "CRITICAL": "INTERVENTION_REQUIRED",
    }

    condition = (
        "Scattered Showers"
        if precipitation_mm > 5
        else random.choice(WEATHER_CONDITIONS)
    )

    return {
        "id": sector_id,
        "code": info["code"],
        "name": info["name"],
        "description": f"Live AI-monitored sector near {info['location']}.",
        "riskScore": round(density),
        "riskLevel": risk_level,
        "predictedIssue": (
            f"Crowd density trending {risk_level.lower()} "
            f"for the {get_time_slot(now.hour).lower()} slot."
        ),
        "confidence": round(random.uniform(85, 98)),
        "crowdCount": int(info["maxSafeCapacity"] * density / 100),
        "crowdDensity": round(1.2 + density / 100 * 4.6, 2),
        "maxSafeCapacity": info["maxSafeCapacity"],
        "coordinates": {
            "x": 50,
            "y": 50,
            "width": 200,
            "height": 150,
        },
        "weather": {
            "temp": temperature_c,
            "feelsLike": round(temperature_c + random.uniform(1, 4), 1),
            "humidity": humidity_percent,
            "rainProbability": round(min(100, precipitation_mm * 6)),
            "windSpeed": wind_speed_kmh,
            "condition": condition,
            "heatRisk": heat_risk_from_temp(temperature_c),
            "airQualityIndex": round(random.uniform(40, 90)),
        },
        "status": status_map[risk_level],
        "activeUnits": {
            "police": random.randint(10, 40),
            "volunteers": random.randint(20, 70),
            "ambulances": random.randint(2, 6),
        },
    }


class IncidentIn(BaseModel):
    type: str
    title: str
    description: str = ""
    zoneId: str
    zoneName: str
    priority: str
    reportedBy: str
    reportedRole: str
    locationDetails: str = ""
    coordinates: dict
    evidenceUrl: Optional[str] = None
    audioNote: Optional[str] = None


class IncidentUpdate(BaseModel):
    status: str
    assignedUnits: Optional[List[str]] = None


class RecommendationApprovalIn(BaseModel):
    approverName: str = "SP / District Collector"


class TaskCompletionIn(BaseModel):
    evidenceNotes: Optional[str] = None
    evidencePhoto: Optional[str] = None


_recommendations: List[dict] = [
    {
        "id": "rec-01",
        "title": "Divert inflow from Sector C to Sector D",
        "recommendedAction": (
            "Redirect pilgrim flow via alternate route "
            "to relieve VIP Junction bottleneck."
        ),
        "targetZone": "Palkhi Marg & VIP Junction",
        "targetZoneId": "sector-c",
        "reason": "Rising crowd density combined with peak-hour inflow.",
        "expectedImpact": (
            "Reduces density by an estimated 15–20% within 20 minutes."
        ),
        "confidence": 91,
        "status": "PENDING_APPROVAL",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "suggestedResources": {
            "divertRouteName": "Route B - East Bypass",
            "policeReallocation": 10,
        },
        "estimatedResolutionMinutes": 20,
        "preventedIncidentEstimate": "1 potential crowd bottleneck",
    }
]

_tasks: List[dict] = []

_routes = [
    {
        "id": "route-1a",
        "name": "Primary Palkhi Spine (Shivaji Chowk)",
        "status": "ACTIVE",
        "etaMinutes": 75,
    },
    {
        "id": "route-2",
        "name": "Bypass 2 (Bhakti Marg Green Corridor)",
        "status": "RECOMMENDED",
        "etaMinutes": 35,
    },
    {
        "id": "route-3c",
        "name": "Ghat Link Promenade (Riverbanks)",
        "status": "ACTIVE",
        "etaMinutes": 22,
    },
]


@app.get("/api/zones/risk")
def get_zones_risk():
    return [build_zone_payload(sector_id) for sector_id in SECTOR_MAP]


@app.get("/api/zones/{sector_id}")
def get_zone_detail(sector_id: str):
    if sector_id not in SECTOR_MAP:
        raise HTTPException(status_code=404, detail="Zone not found")

    return build_zone_payload(sector_id)


@app.get("/api/incidents")
def get_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    zone_id: Optional[str] = None,
):
    return db_list_incidents(
        status=status,
        priority=priority,
        zone_id=zone_id,
    )


@app.post("/api/incidents", status_code=201)
def create_incident_endpoint(
    incident: IncidentIn,
    current_user: dict = Depends(get_current_user),
):
    valid_priorities = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

    if incident.priority.upper() not in valid_priorities:
        raise HTTPException(
            status_code=422,
            detail="Invalid incident priority",
        )

    payload = incident.model_dump()

    role_mapping = {
        "pilgrim": "PILGRIM",
        "volunteer": "VOLUNTEER",
        "police": "POLICE",
        "temple-authority": "POLICE",
    }

    payload["reportedBy"] = current_user["sub"]
    payload["reportedRole"] = role_mapping[current_user["role"]]
    payload["priority"] = payload["priority"].upper()

    return db_create_incident(payload)


@app.patch("/api/incidents/{incident_id}")
def update_incident_endpoint(
    incident_id: str,
    update: IncidentUpdate,
    current_user: dict = Depends(
        require_roles("police", "temple-authority")
    ),
):
    if db_get_incident(incident_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return db_update_incident(
        incident_id,
        update.model_dump(exclude_none=True),
    )


@app.get("/api/facilities")
def get_facilities(
    zone_id: Optional[str] = Query(default=None),
    facility_type: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    limit: int = Query(default=500, ge=1, le=500),
):
    return list_facilities(
        zone_id=zone_id,
        facility_type=facility_type,
        status=status,
        limit=limit,
    )


@app.get("/api/facilities/{facility_id}")
def get_facility(facility_id: str):
    facility = get_facility_by_id(facility_id)

    if facility is None:
        raise HTTPException(
            status_code=404,
            detail="Facility not found",
        )

    return facility


@app.get("/api/recommendations/next")
def get_next_recommendation():
    return next(
        (
            recommendation
            for recommendation in _recommendations
            if recommendation["status"]
            in ("PENDING_APPROVAL", "APPROVED")
        ),
        None,
    )


@app.post("/api/recommendations/{rec_id}/approve")
def approve_recommendation(
    rec_id: str,
    request: RecommendationApprovalIn,
    current_user: dict = Depends(
        require_roles("police", "temple-authority")
    ),
):
    recommendation = next(
        (
            item
            for item in _recommendations
            if item["id"] == rec_id
        ),
        None,
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Recommendation not found",
        )

    recommendation["status"] = "APPROVED"
    recommendation["approvedBy"] = request.approverName
    recommendation["approvedAt"] = datetime.datetime.now().strftime("%H:%M:%S")

    return recommendation


@app.post("/api/tasks/{task_id}/complete")
def complete_task(
    task_id: str,
    request: TaskCompletionIn,
    current_user: dict = Depends(require_roles("volunteer")),
):
    task = next(
        (item for item in _tasks if item["id"] == task_id),
        None,
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    task["status"] = "COMPLETED"
    task["evidenceNotes"] = request.evidenceNotes
    task["evidencePhoto"] = request.evidencePhoto

    return task


@app.get("/api/dashboard/summary")
def dashboard_summary():
    zones = [
        build_zone_payload(sector_id)
        for sector_id in SECTOR_MAP
    ]

    with get_db() as conn:
        active_incidents = conn.execute(
            """
            SELECT COUNT(*) AS count
            FROM incidents
            WHERE status != 'RESOLVED'
            """
        ).fetchone()["count"]

    return {
        "groundCrowdTelemetry": sum(
            zone["crowdCount"] for zone in zones
        ),
        "activeIncidents": active_incidents,
        "policePatrols": sum(
            zone["activeUnits"]["police"] for zone in zones
        ),
        "activePersonnel": sum(
            zone["activeUnits"]["police"]
            + zone["activeUnits"]["volunteers"]
            for zone in zones
        ),
        "ambulanceUnits": sum(
            zone["activeUnits"]["ambulances"] for zone in zones
        ),
        "activeHotspot": max(
            zones,
            key=lambda zone: zone["riskScore"],
        )["code"],
    }


@app.get("/api/routes")
def get_routes():
    return _routes


@app.post("/api/routes/{route_id}/execute")
def execute_reroute(route_id: str):
    route = next(
        (item for item in _routes if item["id"] == route_id),
        None,
    )

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    route["status"] = "ACTIVE"
    return route


@app.get("/")
def root():
    return {
        "status": "VARI-Net backend running",
        "endpoints": [
            "/api/zones/risk",
            "/api/incidents",
            "/api/facilities",
            "/api/recommendations/next",
            "/api/auth/login",
            "/api/auth/register",
        ],
    }