import enum
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class AppointmentStatusEnum(str, enum.Enum):
    PENDING_MEDIATOR = "PENDING_MEDIATOR"
    FORWARDED_TO_PRINCIPAL = "FORWARDED_TO_PRINCIPAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    RESCHEDULED = "RESCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PriorityLevelEnum(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Urgent = "Urgent"

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True) # e.g. APT-2026-1001
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    requested_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    target_persona: Mapped[str] = mapped_column(String(100), default="Principal", nullable=False)
    
    preferred_date: Mapped[str] = mapped_column(String(50), nullable=False)
    preferred_time: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[PriorityLevelEnum] = mapped_column(SQLEnum(PriorityLevelEnum, native_enum=False), default=PriorityLevelEnum.Medium)
    status: Mapped[AppointmentStatusEnum] = mapped_column(SQLEnum(AppointmentStatusEnum, native_enum=False), default=AppointmentStatusEnum.PENDING_MEDIATOR, index=True)
    
    mediator_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    principal_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scheduled_slot: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    attachment_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    attachment_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    attachment_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    requested_by = relationship("User", foreign_keys=[requested_by_id], back_populates="appointments_requested")
    history = relationship("AppointmentHistory", back_populates="appointment", cascade="all, delete-orphan", order_by="AppointmentHistory.created_at.desc()")

class AppointmentHistory(Base):
    __tablename__ = "appointment_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_id: Mapped[str] = mapped_column(ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(50), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    appointment = relationship("Appointment", back_populates="history")

class AppointmentSlot(Base):
    __tablename__ = "appointment_slots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date_str: Mapped[str] = mapped_column(String(20), nullable=False, index=True) # YYYY-MM-DD
    time_str: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. 10:00 AM
    is_booked: Mapped[bool] = mapped_column(default=False, nullable=False)
    booked_appointment_id: Mapped[Optional[str]] = mapped_column(ForeignKey("appointments.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
