from pydantic import BaseModel

class AuditLogRead(BaseModel):
    id: str
    timestamp: str
    actorName: str
    actorRole: str
    actionType: str
    details: str
    ipAddress: str

    class Config:
        from_attributes = True
