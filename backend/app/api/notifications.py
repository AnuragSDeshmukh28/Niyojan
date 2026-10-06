from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationRead

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationRead])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "timestamp": n.timestamp_str,
        "read": n.read,
        "relatedId": n.related_id,
        "relatedType": n.related_type
    } for n in notifs]

@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.read == False
    ).count()
    return {"unread_count": count}

@router.put("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    if notif:
        notif.read = True
        db.commit()
    return {"success": True}

@router.put("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).update({"read": True})
    db.commit()
    return {"success": True}
