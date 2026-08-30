# VARI-Net Release Checklist

## Repository

- [ ] `frontend/` and `backend/` are in the same repository root
- [ ] `.venv/`, `node_modules/`, `.env` and build output are not committed
- [ ] Model `.pkl` files required by the demo are present
- [ ] Training CSV is clearly labelled as prototype/synthetic where applicable
- [ ] No real personal data or private credentials are committed
- [ ] `README.md` matches the current SQLite architecture

## Backend

- [ ] `verify_stage21.py` reports 11 passed and 0 failed
- [ ] FastAPI starts without duplicate-route warnings
- [ ] Swagger shows each temple queue route once
- [ ] SQLite tables persist predictions and alerts
- [ ] `.env` contains a private JWT key
- [ ] Demo accounts are clearly identified as demo-only

## Frontend

- [ ] `npm run build` succeeds
- [ ] Login works for all four demo roles
- [ ] Temple queue form accepts input
- [ ] Prediction result appears
- [ ] Alert explanation and recommended action appear
- [ ] Approve, Reject and Resolve actions work
- [ ] Browser Console contains no red errors

## Demonstration

- [ ] Backend and frontend can be started before the presentation
- [ ] One high-risk queue example is ready
- [ ] One incident example is ready
- [ ] Facilities and zone views load
- [ ] Demo uses only fictional/prototype operational data
- [ ] Team explains that humans retain final authority

## Git

- [ ] `git status` shows only intended changes
- [ ] Final commit message is clear
- [ ] Repository opens correctly after a fresh clone or ZIP extraction
- [ ] README setup steps have been tested once

