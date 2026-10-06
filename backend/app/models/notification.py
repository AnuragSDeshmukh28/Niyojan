from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    recipient_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(20), default="info", nullable=False) # info, success, warning, urgent
    timestamp_str: Mapped[str] = mapped_column(String(50), nullable=False) # "Just now", "10 mins ago"
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    
    related_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    related_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # appointment, document, system
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    recipient = relationship("User", back_populates="notifications")
