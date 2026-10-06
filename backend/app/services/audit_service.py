from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User

def log_audit_event(
    db: Session,
    actor_name: str,
    actor_role: str,
    action_type: str,
    details: str,
    actor_id: Optional[str] = None,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    log_id = f"LOG-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    timestamp_str = datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")
    
    log_entry = AuditLog(
        id=log_id,
        timestamp=timestamp_str,
        actor_id=actor_id,
        actor_name=actor_name,
        actor_role=actor_role.lower(),
        action_type=action_type,
        details=details,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
