# VARI-Net

VARI-Net is an AI-assisted decision-intelligence platform for managing large
pilgrimage events. The current MVP uses the Pandharpur Wari and the
Vitthal-Rukmini Temple queue as its primary demonstration scenario.

The system follows this operational loop:

> Sense → Understand → Prioritize → Recommend → Human Approve → Coordinate → Monitor

## Current MVP

- Role-based login for Pilgrim, Volunteer, Police and Temple Authority
- Crowd-density risk prediction by operational zone
- Temple queue wait-time prediction using a trained scikit-learn pipeline
- Explainable queue alerts with recommended actions
- Human approval, rejection and resolution of queue alerts
- Incident reporting and police-side status management
- SQLite-backed users, incidents, facilities, predictions and alerts
- Facility and zone views
- React dashboards connected to FastAPI

## Technology

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | SQLite |
| Machine learning | pandas, scikit-learn, joblib |
| Authentication | bcrypt, JWT |

## Repository structure

```text
varinett/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── varinet.db
│   ├── models/
│   ├── repositories/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── training/
│   └── verify_stage21.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── start-varinet.ps1
```

## Backend setup

Open PowerShell in the repository root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set a private JWT key inside `backend/.env` before deployment.

Start FastAPI:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend setup

Open another PowerShell terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The local frontend normally opens at:

```text
http://127.0.0.1:5173
```

## One-command Windows startup

After completing backend and frontend setup, run from the repository root:

```powershell
.\start-varinet.ps1
```

This opens separate backend and frontend terminals.

## Temple queue API contract

```text
POST  /api/temple-queue/predict
GET   /api/temple-queue/history
GET   /api/temple-queue/alerts
PATCH /api/temple-queue/alerts/{alert_id}
```

The prediction request uses:

```json
{
  "date": "2026-07-29",
  "hour": 12,
  "waiting_people": 2500,
  "gates_open": 4,
  "crowd_count": 5000,
  "crowd_density": 4.2,
  "zone_id": "Z011",
  "location": "Pandharpur",
  "route_type": "Main",
  "darshan_status": "OPEN",
  "is_peak_day": true
}
```

## Demo accounts

The local seeded demo uses password `demo1234`.

| Role | User ID |
|---|---|
| Temple Authority | TMP-3001 |
| Police | POL-1024 |
| Volunteer | VOL-2001 |
| Pilgrim | WAR-0001 |

These accounts are for local demonstration only and must not be reused in a
production deployment.

## Quality checks

Backend quality gate:

```powershell
cd backend
.\.venv\Scripts\python.exe .\verify_stage21.py
```

Expected result:

```text
Passed: 11
Failed: 0
STAGE 21 RESULT: BACKEND QUALITY GATE PASSED
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Important prototype limitations

- Current results are prototype/simulated unless validated against official
  event telemetry.
- Queue predictions depend on the distribution represented in the training CSV.
- The model recommends actions; authorized officials retain final control.
- CORS and demo credentials must be tightened before public deployment.
- No real pilgrim personal data should be committed to the repository.

## Human-in-the-loop principle

VARI-Net does not automatically open gates, divert pilgrims or dispatch field
teams. It predicts risk, explains the reasoning and presents a recommended
action. Temple Authority or Police personnel approve the operational response.

