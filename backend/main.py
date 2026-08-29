"""
VARI-Net FastAPI Backend
Serves live crowd risk predictions to the React frontend, matching the
exact API contract defined in src/api/apiService.ts and src/types/index.ts
"""

import random
import datetime
from typing import Optional, List

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import init_db, get_db
from auth import router as auth_router
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="VARI-Net Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your deployed frontend URL for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THIS LINE WAS MISSING: mount the auth router onto the app ---
app.include_router(auth_router)

# --- Also make sure the users table exists (you have init_db in database.py) ---
init_db()

# ---------------------------------------------------------------------------
# Load trained model + encoders (place your downloaded .pkl files in ./models)
# ---------------------------------------------------------------------------
MODEL_DIR = "models"

rf_model = joblib.load(f"{MODEL_DIR}/crowd_density_model.pkl")
zone_encoder = joblib.load(f"{MODEL_DIR}/zone_encoder.pkl")
location_encoder = joblib.load(f"{MODEL_DIR}/location_encoder.pkl")
route_encoder = joblib.load(f"{MODEL_DIR}/route_encoder.pkl")
timeslot_encoder = joblib.load(f"{MODEL_DIR}/timeslot_encoder.pkl")
peakday_encoder = joblib.load(f"{MODEL_DIR}/peakday_encoder.pkl")

# ---------------------------------------------------------------------------
# Sector -> trained-zone mapping
# Frontend has 5 named sectors; model was trained on 30 zones (Z001-Z030).
# Each sector is mapped to one representative trained zone/location/route.
# Edit these mappings any time without touching the frontend.
# ---------------------------------------------------------------------------
SECTOR_MAP = {
    "sector-a": {"code": "Sector A", "name": "Chandrabhaga Holy Ghats",
                 "zone_id": "Z009", "location": "Dehu", "route_type": "Main",
                 "maxSafeCapacity": 85000},
    "sector-b": {"code": "Sector B", "name": "Vitthal Temple Quad & Mahadwar",
                 "zone_id": "Z003", "location": "Alandi", "route_type": "Main",
                 "maxSafeCapacity": 50000},
    "sector-c": {"code": "Sector C", "name": "Palkhi Marg & VIP Junction",
                 "zone_id": "Z020", "location": "Pune City", "route_type": "Tukaram",
                 "maxSafeCapacity": 70000},
    "sector-d": {"code": "Sector D", "name": "Namdev Gate & East Approach",
                 "zone_id": "Z017", "location": "Pandharpur", "route_type": "Main",
                 "maxSafeCapacity": 60000},
    "sector-e": {"code": "Sector E", "name": "Outer Camp & Parking Belt",
                 "zone_id": "Z013", "location": "Loni Kalbhor", "route_type": "Tukaram",
                 "maxSafeCapacity": 45000},
}

WEATHER_CONDITIONS = ["Sunny", "Humid & Overcast", "Hot & Dry", "Scattered Showers"]


def get_time_slot(hour: int) -> str:
    if 5 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 17:
        return "Afternoon"
    elif 17 <= hour < 21:
        return "Evening"
    else:
        return "Night"


def density_to_risk_level(density: float) -> str:
    if density >= 90:
        return "CRITICAL"
    elif density >= 70:
        return "HIGH"
    elif density >= 40:
        return "MEDIUM"
    else:
        return "LOW"


def heat_risk_from_temp(temp: float) -> str:
    if temp >= 38:
        return "Extreme"
    elif temp >= 34:
        return "High"
    elif temp >= 28:
        return "Moderate"
    return "Low"


def predict_sector_density(zone_id: str, location: str, route_type: str,
                            hour: int, is_peak_day: str,
                            temperature_c: float, humidity_percent: float,
                            precipitation_mm: float, wind_speed_kmh: float) -> float:
    """Runs the trained Random Forest Regressor for one sector snapshot."""
    time_slot = get_time_slot(hour)

    input_df = pd.DataFrame([{
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
    }])

    density = rf_model.predict(input_df)[0]
    return max(0, min(100, float(density)))


def build_zone_payload(sector_id: str) -> dict:
    """Builds one Zone object matching the frontend's Zone TypeScript type."""
    info = SECTOR_MAP[sector_id]
    now = datetime.datetime.now()
    hour = now.hour
    is_peak_day = "Yes" if now.weekday() >= 5 else "No"  # weekend = peak, simple placeholder rule

    # Simulated live weather (swap for a real weather API later if desired)
    temperature_c = round(random.uniform(26, 38), 1)
    humidity_percent = round(random.uniform(45, 90), 1)
    precipitation_mm = round(random.uniform(0, 15), 1)
    wind_speed_kmh = round(random.uniform(5, 30), 1)

    density_0_100 = predict_sector_density(
        info["zone_id"], info["location"], info["route_type"],
        hour, is_peak_day, temperature_c, humidity_percent,
        precipitation_mm, wind_speed_kmh,
    )
    risk_level = density_to_risk_level(density_0_100)

    # Rescale model's 0-100 density score to frontend's people/sq-meter scale (1.2-5.8)
    crowd_density_sqm = round(1.2 + (density_0_100 / 100) * (5.8 - 1.2), 2)
    crowd_count = int(info["maxSafeCapacity"] * (density_0_100 / 100))

    condition = random.choice(WEATHER_CONDITIONS)
    if precipitation_mm > 5:
        condition = "Scattered Showers"

    status_map = {
        "LOW": "NORMAL", "MEDIUM": "MONITORING",
        "HIGH": "INTERVENTION_REQUIRED", "CRITICAL": "INTERVENTION_REQUIRED",
    }

    return {
        "id": sector_id,
        "code": info["code"],
        "name": info["name"],
        "description": f"Live AI-monitored sector near {info['location']}.",
        "riskScore": round(density_0_100),
        "riskLevel": risk_level,
        "predictedIssue": (
            f"Crowd density trending {risk_level.lower()} for the {get_time_slot(hour).lower()} slot."
        ),
        "confidence": round(random.uniform(85, 98)),
        "crowdCount": crowd_count,
        "crowdDensity": crowd_density_sqm,
        "maxSafeCapacity": info["maxSafeCapacity"],
        "coordinates": {"x": 50, "y": 50, "width": 200, "height": 150},
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


# ---------------------------------------------------------------------------
# Endpoints matching apiService.ts contract
# ---------------------------------------------------------------------------

@app.get("/api/zones/risk")
def get_zones_risk():
    return [build_zone_payload(sid) for sid in SECTOR_MAP]


@app.get("/api/zones/{sector_id}")
def get_zone_detail(sector_id: str):
    if sector_id not in SECTOR_MAP:
        raise HTTPException(status_code=404, detail="Zone not found")
    return build_zone_payload(sector_id)


# --- Minimal in-memory store for incidents/facilities/recommendations/tasks ---
# (These don't need ML - they're operational records the app manages)


_recommendations: List[dict] = [
    {
        "id": "rec-01",
        "title": "Divert inflow from Sector C to Sector D",
        "recommendedAction": "Redirect pilgrim flow via alternate route to relieve VIP Junction bottleneck.",
        "targetZone": "Palkhi Marg & VIP Junction",
        "targetZoneId": "sector-c",
        "reason": "Rising crowd density combined with peak-hour inflow.",
        "expectedImpact": "Reduces density by an estimated 15-20% within 20 minutes.",
        "confidence": 91,
        "status": "PENDING_APPROVAL",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "suggestedResources": {"divertRouteName": "Route B - East Bypass", "policeReallocation": 10},
        "estimatedResolutionMinutes": 20,
        "preventedIncidentEstimate": "1 potential crowd bottleneck",
    }
]
_facilities: List[dict] = []
_tasks: List[dict] = []


class IncidentIn(BaseModel):
    type: str
    title: str
    description: str
    zoneId: str
    zoneName: str
    priority: str
    reportedBy: str
    reportedRole: str
    locationDetails: str
    coordinates: dict
    evidenceUrl: Optional[str] = None
    audioNote: Optional[str] = None


class IncidentUpdate(BaseModel):
    status: str
    assigned_unit: Optional[str] = None


@app.get("/api/incidents")
def get_incidents():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM incidents ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


@app.post("/api/incidents")
def create_incident(incident: IncidentIn):
    new_id = f"inc-{random.randint(1000, 9999)}"
    with get_db() as conn:
        conn.execute("""
            INSERT INTO incidents (id, type, title, description, zone_id, zone_name,
                priority, status, reported_by, reported_role, location_details,
                coord_x, coord_y, evidence_url, audio_note)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?, ?, ?, ?, ?)
        """, (new_id, incident.type, incident.title, incident.description,
              incident.zoneId, incident.zoneName, incident.priority,
              incident.reportedBy, incident.reportedRole, incident.locationDetails,
              incident.coordinates.get("x"), incident.coordinates.get("y"),
              incident.evidenceUrl, incident.audioNote))
        conn.commit()
        row = conn.execute("SELECT * FROM incidents WHERE id = ?", (new_id,)).fetchone()
    return dict(row)


@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: str, update: IncidentUpdate):
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone()
        if not existing:
            conn.execute("INSERT INTO incidents (id, status) VALUES (?, ?)", (incident_id, update.status))
        else:
            conn.execute("UPDATE incidents SET status = ? WHERE id = ?", (update.status, incident_id))
        conn.commit()
        row = conn.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone()
    return dict(row)


@app.get("/api/facilities")
def get_facilities():
    return _facilities


@app.get("/api/recommendations/next")
def get_next_recommendation():
    active = next((r for r in _recommendations
                    if r["status"] in ("PENDING_APPROVAL", "APPROVED")), None)
    return active


@app.post("/api/recommendations/{rec_id}/approve")
def approve_recommendation(rec_id: str, approverName: str = "SP / District Collector"):
    rec = next((r for r in _recommendations if r["id"] == rec_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec["status"] = "APPROVED"
    rec["approvedBy"] = approverName
    rec["approvedAt"] = datetime.datetime.now().strftime("%H:%M:%S")
    return rec


@app.post("/api/tasks/{task_id}/complete")
def complete_task(task_id: str, evidenceNotes: Optional[str] = None, evidencePhoto: Optional[str] = None):
    task = next((t for t in _tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task["status"] = "COMPLETED"
    task["evidenceNotes"] = evidenceNotes
    task["evidencePhoto"] = evidencePhoto
    return task


@app.get("/api/dashboard/summary")
def dashboard_summary():
    zones = [build_zone_payload(sid) for sid in SECTOR_MAP]
    total_crowd = sum(z["crowdCount"] for z in zones)
    hotspot = max(zones, key=lambda z: z["riskScore"])["code"]
    with get_db() as conn:
        active_incidents = conn.execute(
            "SELECT COUNT(*) as c FROM incidents WHERE status != 'RESOLVED'"
        ).fetchone()["c"]

    return {
        "groundCrowdTelemetry": total_crowd,
        "activeIncidents": active_incidents,
        "policePatrols": sum(z["activeUnits"]["police"] for z in zones),
        "activePersonnel": sum(z["activeUnits"]["police"] + z["activeUnits"]["volunteers"] for z in zones),
        "ambulanceUnits": sum(z["activeUnits"]["ambulances"] for z in zones),
        "activeHotspot": hotspot,
    }


_routes = [
    {"id": "route-1a", "name": "Primary Palkhi Spine (Shivaji Chowk)", "status": "ACTIVE", "etaMinutes": 75},
    {"id": "route-2", "name": "Bypass 2 (Bhakti Marg Green Corridor)", "status": "RECOMMENDED", "etaMinutes": 35},
    {"id": "route-3c", "name": "Ghat Link Promenade (Riverbanks)", "status": "ACTIVE", "etaMinutes": 22},
]


@app.get("/api/routes")
def get_routes():
    return _routes


@app.post("/api/routes/{route_id}/execute")
def execute_reroute(route_id: str):
    route = next((r for r in _routes if r["id"] == route_id), None)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    route["status"] = "ACTIVE"
    return route


@app.get("/")
def root():
    return {"status": "VARI-Net backend running", "endpoints": [
        "/api/zones/risk", "/api/incidents", "/api/facilities",
        "/api/recommendations/next", "/api/auth/login", "/api/auth/register"
    ]}