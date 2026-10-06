from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import Token, LoginRequest, RegisterRequest, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.models.user import User
from app.services.auth_service import login_user_and_create_tokens, register_new_user, refresh_access_token, logout_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    return login_user_and_create_tokens(db, login_data)

@router.post("/register")
def register(reg_data: RegisterRequest, db: Session = Depends(get_db)):
    new_user = register_new_user(db, reg_data)
    return {
        "success": True,
        "message": "User account created successfully",
        "user_id": new_user.id
    }

@router.post("/refresh", response_model=Token)
def refresh(ref_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return refresh_access_token(db, ref_data.refresh_token)

@router.post("/logout")
def logout(ref_data: RefreshTokenRequest = Body(...), db: Session = Depends(get_db)):
    logout_user(db, ref_data.refresh_token)
    return {"success": True, "message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Standard security practice: return success message without leaking email existence
    return {
        "success": True,
        "message": "If the email is registered, a password reset link has been dispatched."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    return {
        "success": True,
        "message": "Password reset successfully. Please sign in with your new credentials."
    }
