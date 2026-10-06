from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.role import RoleName
from app.models.user import User
from app.models.appointment import Appointment
from app.models.document import Document
from app.models.availability import PrincipalAvailability
from app.schemas.appointment import AppointmentRead, ApproveAppointmentRequest, RejectAppointmentRequest, RescheduleAppointmentRequest
from app.schemas.document import DocumentRead, DocumentReviewRequest
from app.schemas.availability import PrincipalAvailabilityCreate, PrincipalAvailabilityRead
from app.services.appointment_service import approve_by_principal, reject_appointment, reschedule_appointment, format_appointment_response
from app.services.document_service import approve_document_by_principal, revoke_document, format_document_response

router = APIRouter(prefix="/principal", tags=["Principal Executive Workflow"])

@router.get("/appointments", response_model=List[AppointmentRead])
def list_principal_appointments(
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    apts = db.query(Appointment).order_by(Appointment.created_at.desc()).all()
    return [format_appointment_response(a) for a in apts]

@router.post("/appointments/{appointment_id}/approve", response_model=AppointmentRead)
def principal_approve_appointment(
    appointment_id: str,
    req: ApproveAppointmentRequest,
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    return approve_by_principal(db, current_user, appointment_id, req.slotTime, req.remarks)

@router.post("/appointments/{appointment_id}/reject", response_model=AppointmentRead)
def principal_reject_appointment(
    appointment_id: str,
    req: RejectAppointmentRequest,
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    return reject_appointment(db, current_user, appointment_id, req.remarks)

@router.post("/appointments/{appointment_id}/reschedule", response_model=AppointmentRead)
def principal_reschedule_appointment(
    appointment_id: str,
    req: RescheduleAppointmentRequest,
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    return reschedule_appointment(db, current_user, appointment_id, req.newDate, req.newTime, req.remarks)

@router.get("/documents", response_model=List[DocumentRead])
def list_principal_documents(
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return [format_document_response(d) for d in docs]

@router.post("/documents/{document_id}/approve", response_model=DocumentRead)
def principal_approve_document(
    document_id: str,
    req: DocumentReviewRequest,
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    return approve_document_by_principal(db, current_user, document_id, req.note)

@router.post("/documents/{document_id}/revoke", response_model=DocumentRead)
def principal_revoke_document(
    document_id: str,
    req: DocumentReviewRequest,
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    return revoke_document(db, current_user, document_id, req.note)

@router.get("/availability", response_model=List[PrincipalAvailabilityRead])
def get_availability(
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    return db.query(PrincipalAvailability).filter(PrincipalAvailability.is_active == True).all()

@router.post("/availability", response_model=PrincipalAvailabilityRead)
def create_availability(
    req: PrincipalAvailabilityCreate,
    current_user: User = Depends(require_role(RoleName.PRINCIPAL)),
    db: Session = Depends(get_db)
):
    avail = PrincipalAvailability(
        date_str=req.date_str,
        start_time=req.start_time,
        end_time=req.end_time,
        slot_duration_minutes=req.slot_duration_minutes,
        max_appointments=req.max_appointments
    )
    db.add(avail)
    db.commit()
    db.refresh(avail)
    return avail
