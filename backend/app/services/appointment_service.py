import random
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status, BackgroundTasks

from app.models.appointment import Appointment, AppointmentHistory, AppointmentSlot, AppointmentStatusEnum, PriorityLevelEnum
from app.models.user import User
from app.schemas.appointment import AppointmentCreate
from app.services.notification_service import create_notification
from app.services.audit_service import log_audit_event
from app.services.blockchain_service import blockchain_service
from app.core.config import settings

def format_appointment_response(apt: Appointment) -> dict:
    req_user = apt.requested_by
    requested_by_dict = {
        "id": req_user.id if req_user else "N/A",
        "name": req_user.full_name if req_user else "Unknown Requester",
        "role": req_user.role.name.value if req_user else "student",
        "email": req_user.email if req_user else "",
        "identifier": req_user.identifier if req_user else "",
        "avatar": req_user.avatar if req_user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    }

    history_list = []
    for h in apt.history:
        history_list.append({
            "id": f"h_{h.id}",
            "actor": h.actor_name,
            "role": h.actor_role,
            "action": h.action,
            "timestamp": h.created_at.strftime("%m/%d/%Y, %I:%M:%S %p"),
            "comment": h.comment
        })

    return {
        "id": apt.id,
        "subject": apt.subject,
        "category": apt.category,
        "description": apt.description,
        "requestedBy": requested_by_dict,
        "targetPersona": apt.target_persona,
        "preferredDate": apt.preferred_date,
        "preferredTime": apt.preferred_time,
        "priority": apt.priority.value,
        "status": apt.status.value,
        "mediatorRemarks": apt.mediator_remarks,
        "principalRemarks": apt.principal_remarks,
        "scheduledSlot": apt.scheduled_slot,
        "attachmentName": apt.attachment_name,
        "attachmentSize": apt.attachment_size,
        "sha256_hash": apt.sha256_hash,
        "blockchain_tx_hash": apt.blockchain_tx_hash,
        "blockchain_status": apt.blockchain_status or "unanchored",
        "blockchain_explorer_url": blockchain_service.get_explorer_url(apt.blockchain_tx_hash),
        "createdAt": apt.created_at.strftime("%m/%d/%Y, %I:%M:%S %p"),
        "updatedAt": apt.updated_at.strftime("%m/%d/%Y, %I:%M:%S %p"),
        "history": history_list
    }

def create_appointment(db: Session, user: User, apt_data: AppointmentCreate) -> dict:
    year = datetime.now().year
    rand_num = random.randint(1000, 9999)
    apt_id = f"APT-{year}-{rand_num}"
    now_str = datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")

    new_apt = Appointment(
        id=apt_id,
        subject=apt_data.subject,
        category=apt_data.category,
        description=apt_data.description,
        requested_by_id=user.id,
        target_persona=apt_data.targetPersona,
        preferred_date=apt_data.preferredDate,
        preferred_time=apt_data.preferredTime,
        priority=PriorityLevelEnum(apt_data.priority),
        status=AppointmentStatusEnum.PENDING_MEDIATOR
    )
    db.add(new_apt)
    db.flush()

    # Create Initial History
    initial_history = AppointmentHistory(
        appointment_id=apt_id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action="Submitted Request",
        comment="Submitted online via Niyojan platform."
    )
    db.add(initial_history)
    db.commit()
    db.refresh(new_apt)

    # Notify user
    create_notification(
        db=db,
        recipient_id=user.id,
        title="New Appointment Request Created",
        message=f"Request {apt_id} submitted and sent to Mediator Desk for verification.",
        notif_type="info",
        related_id=apt_id,
        related_type="appointment"
    )

    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action_type="CREATE_APPOINTMENT",
        details=f"Created appointment request {apt_id}: '{apt_data.subject}'"
    )

    return format_appointment_response(new_apt)

def forward_by_mediator(db: Session, mediator_user: User, appointment_id: str, remarks: str) -> dict:
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment request not found")

    if apt.status != AppointmentStatusEnum.PENDING_MEDIATOR:
        raise HTTPException(status_code=400, detail=f"Cannot forward appointment in status '{apt.status.value}'")

    apt.status = AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL
    apt.mediator_remarks = remarks
    apt.updated_at = datetime.now(timezone.utc)

    history = AppointmentHistory(
        appointment_id=appointment_id,
        actor_name=mediator_user.full_name,
        actor_role=mediator_user.role.name.value,
        action="Reviewed & Forwarded to Principal",
        comment=remarks
    )
    db.add(history)
    db.commit()
    db.refresh(apt)

    # Notify Requester
    create_notification(
        db=db,
        recipient_id=apt.requested_by_id,
        title="Request Escalated to Principal",
        message=f"Mediator verified request {appointment_id} and forwarded to Principal Executive Desk.",
        notif_type="info",
        related_id=appointment_id,
        related_type="appointment"
    )

    log_audit_event(
        db=db,
        actor_id=mediator_user.id,
        actor_name=mediator_user.full_name,
        actor_role=mediator_user.role.name.value,
        action_type="MEDIATOR_FORWARD",
        details=f"Forwarded {appointment_id} to Principal with remarks: '{remarks}'"
    )

    return format_appointment_response(apt)

def approve_by_principal(
    db: Session,
    principal_user: User,
    appointment_id: str,
    slot_time: str,
    remarks: str,
    background_tasks: Optional[BackgroundTasks] = None
) -> dict:
    # Transactional check & lock to prevent double-booking
    with db.begin_nested():
        apt = db.query(Appointment).filter(Appointment.id == appointment_id).with_for_update().first()
        if not apt:
            raise HTTPException(status_code=404, detail="Appointment request not found")

        # Verify slot availability if slot record exists
        slot_record = db.query(AppointmentSlot).filter(
            AppointmentSlot.date_str == apt.preferred_date,
            AppointmentSlot.time_str == slot_time
        ).with_for_update().first()

        if slot_record and slot_record.is_booked and slot_record.booked_appointment_id != appointment_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Slot '{slot_time}' on {apt.preferred_date} is already booked by another user."
            )

        if not slot_record:
            slot_record = AppointmentSlot(
                date_str=apt.preferred_date,
                time_str=slot_time,
                is_booked=True,
                booked_appointment_id=appointment_id
            )
            db.add(slot_record)
        else:
            slot_record.is_booked = True
            slot_record.booked_appointment_id = appointment_id

        apt.status = AppointmentStatusEnum.APPROVED
        apt.scheduled_slot = slot_time
        apt.principal_remarks = remarks

        # Compute tamper-proof hash digest for appointment
        digest_data = f"{apt.id}|{apt.requested_by_id}|{apt.subject}|{slot_time}|{apt.preferred_date}|{principal_user.id}"
        apt_hash = hashlib.sha256(digest_data.encode()).hexdigest()
        apt.sha256_hash = apt_hash
        if settings.BLOCKCHAIN_ENABLED:
            apt.blockchain_status = "pending"

        apt.updated_at = datetime.now(timezone.utc)

        history = AppointmentHistory(
            appointment_id=appointment_id,
            actor_name=principal_user.full_name,
            actor_role=principal_user.role.name.value,
            action="Approved & Scheduled",
            comment=f"Slot: {slot_time}. Notes: {remarks}"
        )
        db.add(history)

    db.commit()
    db.refresh(apt)

    if background_tasks and settings.BLOCKCHAIN_ENABLED:
        background_tasks.add_task(blockchain_service.anchor_document_on_chain, apt.id, apt_hash, "appointment")

    create_notification(
        db=db,
        recipient_id=apt.requested_by_id,
        title="Appointment Approved!",
        message=f"Principal has approved {appointment_id} for slot {slot_time}.",
        notif_type="success",
        related_id=appointment_id,
        related_type="appointment"
    )

    log_audit_event(
        db=db,
        actor_id=principal_user.id,
        actor_name=principal_user.full_name,
        actor_role=principal_user.role.name.value,
        action_type="PRINCIPAL_APPROVE",
        details=f"Approved appointment {appointment_id}. Slot allocated: {slot_time}"
    )

    return format_appointment_response(apt)

def reject_appointment(db: Session, user: User, appointment_id: str, remarks: str) -> dict:
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment request not found")

    apt.status = AppointmentStatusEnum.REJECTED
    if user.role.name.value == "principal":
        apt.principal_remarks = remarks
    else:
        apt.mediator_remarks = remarks

    apt.updated_at = datetime.now(timezone.utc)

    history = AppointmentHistory(
        appointment_id=appointment_id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action="Rejected Request",
        comment=remarks
    )
    db.add(history)
    db.commit()
    db.refresh(apt)

    create_notification(
        db=db,
        recipient_id=apt.requested_by_id,
        title="Appointment Request Rejected",
        message=f"Request {appointment_id} was rejected. Reason: {remarks}",
        notif_type="warning",
        related_id=appointment_id,
        related_type="appointment"
    )

    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action_type="REJECT_REQUEST",
        details=f"Rejected request {appointment_id} with reason: '{remarks}'"
    )

    return format_appointment_response(apt)

def reschedule_appointment(db: Session, principal_user: User, appointment_id: str, new_date: str, new_time: str, remarks: str) -> dict:
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment request not found")

    formatted_slot = f"{new_date} at {new_time}"
    apt.status = AppointmentStatusEnum.RESCHEDULED
    apt.preferred_date = new_date
    apt.preferred_time = new_time
    apt.scheduled_slot = formatted_slot
    apt.principal_remarks = remarks
    apt.updated_at = datetime.now(timezone.utc)

    history = AppointmentHistory(
        appointment_id=appointment_id,
        actor_name=principal_user.full_name,
        actor_role=principal_user.role.name.value,
        action="Rescheduled Slot",
        comment=f"Rescheduled to {formatted_slot}. Reason: {remarks}"
    )
    db.add(history)
    db.commit()
    db.refresh(apt)

    create_notification(
        db=db,
        recipient_id=apt.requested_by_id,
        title="Appointment Rescheduled",
        message=f"Request {appointment_id} rescheduled to {formatted_slot}.",
        notif_type="info",
        related_id=appointment_id,
        related_type="appointment"
    )

    log_audit_event(
        db=db,
        actor_id=principal_user.id,
        actor_name=principal_user.full_name,
        actor_role=principal_user.role.name.value,
        action_type="RESCHEDULE_APPOINTMENT",
        details=f"Rescheduled appointment {appointment_id} to {formatted_slot}"
    )

    return format_appointment_response(apt)
