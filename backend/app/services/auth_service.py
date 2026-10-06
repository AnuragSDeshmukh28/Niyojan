from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.role import Role, RoleName
from app.models.refresh_token import RefreshToken
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.audit_service import log_audit_event

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def login_user_and_create_tokens(db: Session, login_data: LoginRequest) -> dict:
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active or user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended. Contact system administrator."
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token(subject=user.id, role=user.role.name.value)
    refresh_token = create_refresh_token(subject=user.id, role=user.role.name.value)

    # Store refresh token record
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    rf_record = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(rf_record)
    db.commit()

    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action_type="USER_LOGIN",
        details=f"User {user.email} successfully logged into system"
    )

    user_dict = {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role.name.value,
        "avatar": user.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "department": user.department,
        "identifier": user.identifier,
        "phone": user.phone,
        "childName": user.child_name,
        "childRollNo": user.child_roll_no,
        "status": user.status
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_dict
    }

def register_new_user(db: Session, reg_data: RegisterRequest) -> User:
    # Restrict registration to normal roles (STUDENT, PARENT, FACULTY)
    requested_role_str = reg_data.role.lower().strip()
    if requested_role_str in ["admin", "principal", "mediator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration for privileged roles (Admin, Principal, Mediator) is strictly prohibited."
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == reg_data.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    try:
        target_role_enum = RoleName(requested_role_str)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role '{requested_role_str}'")

    role_record = db.query(Role).filter(Role.name == target_role_enum).first()
    if not role_record:
        raise HTTPException(status_code=400, detail=f"Invalid role '{requested_role_str}'")

    user_id = f"USR-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    new_user = User(
        id=user_id,
        full_name=reg_data.full_name,
        email=reg_data.email.lower().strip(),
        password_hash=get_password_hash(reg_data.password),
        role_id=role_record.id,
        phone=reg_data.phone,
        identifier=reg_data.identifier or f"2026-{reg_data.role.upper()}-{user_id[-4:]}",
        child_name=reg_data.child_name,
        child_roll_no=reg_data.child_roll_no,
        status="active",
        is_active=True,
        is_verified=True,
        avatar=f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit_event(
        db=db,
        actor_id=new_user.id,
        actor_name=new_user.full_name,
        actor_role=new_user.role.name.value,
        action_type="USER_REGISTER",
        details=f"New user registered with role {new_user.role.name.value}"
    )

    return new_user

def refresh_access_token(db: Session, refresh_token_str: str) -> dict:
    payload = decode_token(refresh_token_str, settings.JWT_REFRESH_SECRET_KEY)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    rf_record = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.is_revoked == False
    ).first()

    if not rf_record or rf_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or expired")

    user = db.query(User).filter(User.id == rf_record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account inactive")

    new_access_token = create_access_token(subject=user.id, role=user.role.name.value)
    
    user_dict = {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role.name.value,
        "avatar": user.avatar,
        "department": user.department,
        "identifier": user.identifier,
        "phone": user.phone,
        "childName": user.child_name,
        "childRollNo": user.child_roll_no,
        "status": user.status
    }

    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "user": user_dict
    }

def logout_user(db: Session, refresh_token_str: str):
    rf_record = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_str).first()
    if rf_record:
        rf_record.is_revoked = True
        db.commit()
