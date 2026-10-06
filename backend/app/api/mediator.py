from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.role import RoleName
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatusEnum
from app.models.document import Document, DocumentStatusEnum
from app.schemas.appointment import AppointmentRead, ForwardAppointmentRequest, RejectAppointmentRequest
from app.schemas.document import DocumentRead, DocumentReviewRequest
from app.services.appointment_service import forward_by_mediator, reject_appointment, format_appointment_response
from app.services.document_service import verify_document_by_mediator, format_document_response

router = APIRouter(prefix="/mediator", tags=["Mediator Workflow"])

@router.get("/appointments", response_model=List[AppointmentRead])
def list_mediator_appointments(
    current_user: User = Depends(require_role(RoleName.MEDIATOR)),
    db: Session = Depends(get_db)
):
    apts = db.query(Appointment).order_by(Appointment.created_at.desc()).all()
    return [format_appointment_response(a) for a in apts]

@router.post("/appointments/{appointment_id}/forward", response_model=AppointmentRead)
def mediator_forward_appointment(
    appointment_id: str,
    req: ForwardAppointmentRequest,
    current_user: User = Depends(require_role(RoleName.MEDIATOR)),
    db: Session = Depends(get_db)
):
    return forward_by_mediator(db, current_user, appointment_id, req.remarks)

@router.post("/appointments/{appointment_id}/reject", response_model=AppointmentRead)
def mediator_reject_appointment(
    appointment_id: str,
    req: RejectAppointmentRequest,
    current_user: User = Depends(require_role(RoleName.MEDIATOR)),
    db: Session = Depends(get_db)
):
    return reject_appointment(db, current_user, appointment_id, req.remarks)

@router.get("/documents", response_model=List[DocumentRead])
def list_mediator_documents(
    current_user: User = Depends(require_role(RoleName.MEDIATOR)),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return [format_document_response(d) for d in docs]

@router.post("/documents/{document_id}/verify", response_model=DocumentRead)
def mediator_verify_document(
    document_id: str,
    req: DocumentReviewRequest,
    current_user: User = Depends(require_role(RoleName.MEDIATOR)),
    db: Session = Depends(get_db)
):
    return verify_document_by_mediator(db, current_user, document_id, req.note)
