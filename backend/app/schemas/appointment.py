from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class AppointmentHistoryStepRead(BaseModel):
    id: str
    actor: str
    role: str
    action: str
    timestamp: str
    comment: Optional[str] = None

class RequestedByRead(BaseModel):
    id: str
    name: str
    role: str
    email: str
    identifier: Optional[str] = None
    avatar: str

class AppointmentCreate(BaseModel):
    subject: str
    category: str
    description: str
    preferredDate: str
    preferredTime: str
    priority: str = "Medium"
    targetPersona: str = "Principal"

class AppointmentRead(BaseModel):
    id: str
    subject: str
    category: str
    description: str
    requestedBy: RequestedByRead
    targetPersona: str
    preferredDate: str
    preferredTime: str
    priority: str
    status: str
    mediatorRemarks: Optional[str] = None
    principalRemarks: Optional[str] = None
    scheduledSlot: Optional[str] = None
    attachmentName: Optional[str] = None
    attachmentSize: Optional[str] = None
    sha256_hash: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_status: Optional[str] = "unanchored"
    blockchain_explorer_url: Optional[str] = None
    createdAt: str
    updatedAt: str
    history: List[AppointmentHistoryStepRead] = []

    class Config:
        from_attributes = True

class ForwardAppointmentRequest(BaseModel):
    remarks: str

class ApproveAppointmentRequest(BaseModel):
    slotTime: str
    remarks: str

class RejectAppointmentRequest(BaseModel):
    remarks: str

class RescheduleAppointmentRequest(BaseModel):
    newDate: str
    newTime: str
    remarks: str
