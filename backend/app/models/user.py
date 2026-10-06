from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    identifier: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True) # Roll No / Employee ID
    child_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    child_roll_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False) # active, suspended, pending
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    role = relationship("Role", back_populates="users")
    appointments_requested = relationship("Appointment", foreign_keys="Appointment.requested_by_id", back_populates="requested_by")
    documents_submitted = relationship("Document", foreign_keys="Document.submitted_by_id", back_populates="submitted_by")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="actor")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
