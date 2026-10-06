from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.user import UserRead, UserUpdate, UserPasswordUpdate
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserRead)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.name.value,
        "avatar": current_user.avatar,
        "department": current_user.department,
        "identifier": current_user.identifier,
        "phone": current_user.phone,
        "childName": current_user.child_name,
        "childRollNo": current_user.child_roll_no,
        "status": current_user.status
    }

@router.put("/me", response_model=UserRead)
def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    if update_data.department is not None:
        current_user.department = update_data.department
    if update_data.identifier is not None:
        current_user.identifier = update_data.identifier
    if update_data.child_name is not None:
        current_user.child_name = update_data.child_name
    if update_data.child_roll_no is not None:
        current_user.child_roll_no = update_data.child_roll_no

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.name.value,
        "avatar": current_user.avatar,
        "department": current_user.department,
        "identifier": current_user.identifier,
        "phone": current_user.phone,
        "childName": current_user.child_name,
        "childRollNo": current_user.child_roll_no,
        "status": current_user.status
    }

@router.put("/me/password")
def update_password(
    pwd_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(pwd_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")

    current_user.password_hash = get_password_hash(pwd_data.new_password)
    db.commit()

    return {"success": True, "message": "Password updated successfully"}

@router.get("/me/activity")
def get_user_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(AuditLog.actor_id == current_user.id).order_by(AuditLog.created_at.desc()).limit(20).all()
    return [{
        "id": l.id,
        "timestamp": l.timestamp,
        "actionType": l.action_type,
        "details": l.details,
        "ipAddress": l.ip_address
    } for l in logs]
