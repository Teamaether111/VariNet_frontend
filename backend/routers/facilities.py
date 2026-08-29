from typing import Optional

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from repositories.facility_repository import (
    get_facility_by_id,
    list_facilities,
)


router = APIRouter(
    prefix="/api/facilities",
    tags=["facilities"],
)


@router.get("")
def get_facilities(
    zone_id: Optional[str] = Query(
        default=None,
        description="Filter using a zone ID",
    ),
    facility_type: Optional[str] = Query(
        default=None,
        description="Filter using frontend facility type",
    ),
    status: Optional[str] = Query(
        default=None,
        description="Filter using facility status",
    ),
    limit: int = Query(
        default=500,
        ge=1,
        le=500,
    ),
):
    return list_facilities(
        zone_id=zone_id,
        facility_type=facility_type,
        status=status,
        limit=limit,
    )


@router.get("/{facility_id}")
def get_facility(facility_id: str):
    facility = get_facility_by_id(
        facility_id.strip().upper()
    )

    if facility is None:
        raise HTTPException(
            status_code=404,
            detail="Facility not found",
        )

    return facility