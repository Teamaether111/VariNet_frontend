from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from auth import (
    get_current_user,
    require_roles,
)

from repositories.incident_repository import (
    create_incident as db_create_incident,
    get_incident_by_id as db_get_incident,
    list_incidents as db_list_incidents,
    update_incident as db_update_incident,
)

from schemas.incidents import (
    IncidentIn,
    IncidentUpdate,
)


router = APIRouter(
    prefix="/api/incidents",
    tags=["incidents"],
)


@router.get("")
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


@router.get("/{incident_id}")
def get_incident(incident_id: str):
    incident = db_get_incident(
        incident_id
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident


@router.post("", status_code=201)
def create_incident(
    incident: IncidentIn,
    current_user: dict = Depends(
        get_current_user
    ),
):
    valid_priorities = {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    priority = incident.priority.upper()

    if priority not in valid_priorities:
        raise HTTPException(
            status_code=422,
            detail="Invalid incident priority",
        )

    payload = incident.model_dump()

    payload["priority"] = priority
    payload["reportedBy"] = (
        current_user["sub"]
    )

    role_mapping = {
        "pilgrim": "PILGRIM",
        "volunteer": "VOLUNTEER",
        "police": "POLICE",
        "temple-authority": "POLICE",
    }

    payload["reportedRole"] = (
        role_mapping[current_user["role"]]
    )

    return db_create_incident(payload)


@router.patch("/{incident_id}")
def update_incident(
    incident_id: str,
    update: IncidentUpdate,
    current_user: dict = Depends(
        require_roles(
            "police",
            "temple-authority",
        )
    ),
):
    try:
        incident = db_update_incident(
            incident_id=incident_id,
            status=update.status,
            assigned_units=update.assignedUnits,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident