from typing import Optional
from pydantic import BaseModel

class PrincipalAvailabilityCreate(BaseModel):
    date_str: str # YYYY-MM-DD
    start_time: str # e.g. 10:00 AM
    end_time: str # e.g. 04:00 PM
    slot_duration_minutes: int = 30
    max_appointments: int = 10

class PrincipalAvailabilityRead(BaseModel):
    id: int
    date_str: str
    start_time: str
    end_time: str
    slot_duration_minutes: int
    max_appointments: int
    is_active: bool

    class Config:
        from_attributes = True
