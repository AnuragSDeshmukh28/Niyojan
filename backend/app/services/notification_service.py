from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(
    db: Session,
    recipient_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
    related_id: Optional[str] = None,
    related_type: Optional[str] = None
) -> Notification:
    notif_id = f"notif_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    notif = Notification(
        id=notif_id,
        recipient_id=recipient_id,
        title=title,
        message=message,
        type=notif_type,
        timestamp_str="Just now",
        read=False,
        related_id=related_id,
        related_type=related_type
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
