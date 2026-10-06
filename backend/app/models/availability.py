from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class PrincipalAvailability(Base):
    __tablename__ = "principal_availability"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date_str: Mapped[str] = mapped_column(String(20), nullable=False, index=True) # YYYY-MM-DD
    start_time: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. 10:00 AM
    end_time: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. 04:00 PM
    slot_duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    max_appointments: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
