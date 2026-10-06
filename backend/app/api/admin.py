from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.role import Role, RoleName
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.user import UserRead, UserCreate, UserUpdate, UserStatusUpdate
from app.schemas.audit import AuditLogRead
from app.core.security import get_password_hash
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/users", response_model=List[UserRead])
def list_all_users(
    role_filter: Optional[str] = Query(None, alias="role"),
    current_user: User = Depends(require_role(RoleName.ADMIN)),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role_filter and role_filter != "ALL":
        query = query.join(Role).filter(Role.name == role_filter.lower())

    users = query.all()
    return [{
        "id": u.id,
        "name": u.full_name,
        "email": u.email,
        "role": u.role.name.value,
        "avatar": u.avatar,
        "department": u.department,
        "identifier": u.identifier,
        "phone": u.phone,
        "childName": u.child_name,
        "childRollNo": u.child_roll_no,
        "status": u.status
    } for u in users]

@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    user_data: UserCreate,
    current_user: User = Depends(require_role(RoleName.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    role_rec = db.query(Role).filter(Role.name == user_data.role.lower()).first()
    if not role_rec:
        raise HTTPException(status_code=400, detail=f"Invalid role '{user_data.role}'")

    user_id = f"USR-{int(datetime.now().timestamp() * 1000)}"
    new_u = User(
        id=user_id,
        full_name=user_data.full_name,
        email=user_data.email.lower().strip(),
        password_hash=get_password_hash(user_data.password),
        role_id=role_rec.id,
        department=user_data.department,
        phone=user_data.phone,
        identifier=user_data.identifier or f"2026-{user_data.role.upper()}-{user_id[-4:]}",
        child_name=user_data.child_name,
        child_roll_no=user_data.child_roll_no,
        status="active",
        is_active=True,
        is_verified=True,
        avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    db.add(new_u)
    db.commit()
    db.refresh(new_u)

    log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role.name.value,
        action_type="ADMIN_CREATE_USER",
        details=f"Admin created user {new_u.email} with role {user_data.role}"
    )

    return {
        "id": new_u.id,
        "name": new_u.full_name,
        "email": new_u.email,
        "role": new_u.role.name.value,
        "avatar": new_u.avatar,
        "department": new_u.department,
        "identifier": new_u.identifier,
        "phone": new_u.phone,
        "childName": new_u.child_name,
        "childRollNo": new_u.child_roll_no,
        "status": new_u.status
    }

@router.patch("/users/{user_id}/status", response_model=UserRead)
def update_user_status(
    user_id: str,
    status_data: UserStatusUpdate,
    current_user: User = Depends(require_role(RoleName.ADMIN)),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.status = status_data.status
    target_user.is_active = (status_data.status == "active")
    db.commit()
    db.refresh(target_user)

    log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role.name.value,
        action_type="ADMIN_UPDATE_USER_STATUS",
        details=f"Updated status of user {target_user.email} to '{status_data.status}'"
    )

    return {
        "id": target_user.id,
        "name": target_user.full_name,
        "email": target_user.email,
        "role": target_user.role.name.value,
        "avatar": target_user.avatar,
        "department": target_user.department,
        "identifier": target_user.identifier,
        "phone": target_user.phone,
        "childName": target_user.child_name,
        "childRollNo": target_user.child_roll_no,
        "status": target_user.status
    }

@router.get("/roles")
def list_roles(current_user: User = Depends(require_role(RoleName.ADMIN)), db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    return [{"id": r.id, "name": r.name.value, "description": r.description} for r in roles]

@router.get("/audit-logs", response_model=List[AuditLogRead])
def list_audit_logs(
    current_user: User = Depends(require_role(RoleName.ADMIN)),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return [{
        "id": l.id,
        "timestamp": l.timestamp,
        "actorName": l.actor_name,
        "actorRole": l.actor_role,
        "actionType": l.action_type,
        "details": l.details,
        "ipAddress": l.ip_address
    } for l in logs]
