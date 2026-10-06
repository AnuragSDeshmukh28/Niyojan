from typing import Optional
from pydantic import BaseModel

class NotificationRead(BaseModel):
    id: str
    title: str
    message: str
    type: str # info, success, warning, urgent
    timestamp: str
    read: bool
    relatedId: Optional[str] = None
    relatedType: Optional[str] = None

    class Config:
        from_attributes = True
