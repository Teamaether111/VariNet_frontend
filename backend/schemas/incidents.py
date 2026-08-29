from typing import List, Optional

from pydantic import BaseModel


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