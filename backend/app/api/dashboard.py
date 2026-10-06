from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatusEnum
from app.models.document import Document, DocumentStatusEnum

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])

@router.get("/student")
def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    my_apts = db.query(Appointment).filter(Appointment.requested_by_id == current_user.id).all()
    my_docs = db.query(Document).filter(Document.submitted_by_id == current_user.id).all()

    total_apts = len(my_apts)
    pending_count = sum(1 for a in my_apts if a.status in [AppointmentStatusEnum.PENDING_MEDIATOR, AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL])
    approved_count = sum(1 for a in my_apts if a.status == AppointmentStatusEnum.APPROVED)
    upcoming_count = sum(1 for a in my_apts if a.status == AppointmentStatusEnum.APPROVED and a.scheduled_slot)

    return {
        "totalAppointments": total_apts,
        "pendingCount": pending_count,
        "approvedCount": approved_count,
        "upcomingCount": upcoming_count,
        "totalDocuments": len(my_docs)
    }

@router.get("/parent")
def get_parent_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    my_apts = db.query(Appointment).filter(Appointment.requested_by_id == current_user.id).all()
    my_docs = db.query(Document).filter(Document.submitted_by_id == current_user.id).all()

    return {
        "totalAppointments": len(my_apts),
        "pendingCount": sum(1 for a in my_apts if a.status in [AppointmentStatusEnum.PENDING_MEDIATOR, AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL]),
        "approvedCount": sum(1 for a in my_apts if a.status == AppointmentStatusEnum.APPROVED),
        "totalDocuments": len(my_docs)
    }

@router.get("/faculty")
def get_faculty_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    my_apts = db.query(Appointment).filter(Appointment.requested_by_id == current_user.id).all()
    my_docs = db.query(Document).filter(Document.submitted_by_id == current_user.id).all()

    return {
        "totalAppointments": len(my_apts),
        "pendingCount": sum(1 for a in my_apts if a.status in [AppointmentStatusEnum.PENDING_MEDIATOR, AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL]),
        "approvedCount": sum(1 for a in my_apts if a.status == AppointmentStatusEnum.APPROVED),
        "totalDocuments": len(my_docs)
    }

@router.get("/mediator")
def get_mediator_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_apts = db.query(Appointment).all()
    all_docs = db.query(Document).all()

    pending_apt_count = sum(1 for a in all_apts if a.status == AppointmentStatusEnum.PENDING_MEDIATOR)
    forwarded_apt_count = sum(1 for a in all_apts if a.status == AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL)
    pending_doc_count = sum(1 for d in all_docs if d.status == DocumentStatusEnum.PENDING_VERIFICATION)

    return {
        "pendingReviewCount": pending_apt_count,
        "forwardedCount": forwarded_apt_count,
        "pendingDocumentsCount": pending_doc_count,
        "totalReviewed": len(all_apts) - pending_apt_count
    }

@router.get("/principal")
def get_principal_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_apts = db.query(Appointment).all()
    all_docs = db.query(Document).all()

    pending_apt = sum(1 for a in all_apts if a.status == AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL)
    approved_apt = sum(1 for a in all_apts if a.status == AppointmentStatusEnum.APPROVED)
    rescheduled_apt = sum(1 for a in all_apts if a.status == AppointmentStatusEnum.RESCHEDULED)
    
    pending_doc = sum(1 for d in all_docs if d.status in [DocumentStatusEnum.PENDING_VERIFICATION, DocumentStatusEnum.VERIFIED_BY_MEDIATOR])
    signed_doc = sum(1 for d in all_docs if d.status == DocumentStatusEnum.APPROVED_BY_PRINCIPAL)

    return {
        "pendingApprovalCount": pending_apt,
        "approvedCount": approved_apt,
        "rescheduledCount": rescheduled_apt,
        "pendingDocumentsCount": pending_doc,
        "totalSignedDocuments": signed_doc
    }

@router.get("/admin")
def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_apts = db.query(Appointment).count()
    total_docs = db.query(Document).count()

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalAppointments": total_apts,
        "totalDocuments": total_docs,
        "systemHealth": "Optimal"
    }
