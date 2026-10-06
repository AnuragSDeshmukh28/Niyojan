from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentRead
from app.services.appointment_service import create_appointment, format_appointment_response

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentRead])
def list_appointments(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)

    # Role-based scoping
    user_role = current_user.role.name.value
    if user_role in ["student", "parent", "faculty"]:
        query = query.filter(Appointment.requested_by_id == current_user.id)
    
    if status_filter and status_filter != "ALL":
        query = query.filter(Appointment.status == status_filter)

    appointments = query.order_by(Appointment.created_at.desc()).all()
    return [format_appointment_response(a) for a in appointments]

@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_new_appointment(
    apt_data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_appointment(db, current_user, apt_data)

@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment_detail(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    user_role = current_user.role.name.value
    if user_role in ["student", "parent", "faculty"] and apt.requested_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this appointment record")

    return format_appointment_response(apt)
