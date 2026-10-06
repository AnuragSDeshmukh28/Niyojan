import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.role import Role, RoleName
from app.models.user import User
from app.models.appointment import Appointment, AppointmentHistory, AppointmentStatusEnum, PriorityLevelEnum
from app.models.document import Document, DocumentStatusEnum
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.models.availability import PrincipalAvailability
from app.core.security import get_password_hash
from app.core.config import settings

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Cleaning up fake/test registration entries...")
        # Purge temporary test users created during test runs
        test_users = db.query(User).filter(
            (User.email.like("%test%")) | 
            (User.email.like("%hacker%")) |
            (User.id.like("USR-17%"))
        ).all()
        for tu in test_users:
            # Remove associated refresh tokens, appointments, etc.
            db.query(AuditLog).filter(AuditLog.actor_id == tu.id).delete(synchronize_session=False)
            db.query(Appointment).filter(Appointment.requested_by_id == tu.id).delete(synchronize_session=False)
            db.query(Document).filter(Document.submitted_by_id == tu.id).delete(synchronize_session=False)
            db.delete(tu)
        db.commit()

        print("Seeding roles...")
        role_map = {}
        for role_enum in RoleName:
            role_obj = db.query(Role).filter(Role.name == role_enum).first()
            if not role_obj:
                role_obj = Role(
                    name=role_enum,
                    description=f"Institutional {role_enum.value.capitalize()} Role"
                )
                db.add(role_obj)
                db.flush()
            role_map[role_enum.value] = role_obj

        db.commit()

        print("Seeding initial institutional accounts...")
        seed_users_def = [
            {
                "id": "USR-ADMIN-001",
                "email": settings.INITIAL_ADMIN_EMAIL,
                "password": settings.INITIAL_ADMIN_PASSWORD,
                "name": "Dr. Rajesh Kumar",
                "role": "admin",
                "department": "IT & Administrative Control",
                "identifier": "EMP-ADM-901",
                "phone": "+91 98765 00001",
                "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
            },
            {
                "id": "USR-PRIN-001",
                "email": settings.INITIAL_PRINCIPAL_EMAIL,
                "password": settings.INITIAL_PRINCIPAL_PASSWORD,
                "name": "Dr. V. K. Sharma",
                "role": "principal",
                "department": "Principal Executive Desk",
                "identifier": "EXEC-001",
                "phone": "+91 98765 00002",
                "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
            },
            {
                "id": "USR-MED-001",
                "email": settings.INITIAL_MEDIATOR_EMAIL,
                "password": settings.INITIAL_MEDIATOR_PASSWORD,
                "name": "Prof. Ananya Roy",
                "role": "mediator",
                "department": "Student Welfare & Desk Officer",
                "identifier": "EMP-MED-402",
                "phone": "+91 98765 00003",
                "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
            },
            {
                "id": "USR-FAC-001",
                "email": settings.INITIAL_FACULTY_EMAIL,
                "password": settings.INITIAL_FACULTY_PASSWORD,
                "name": "Dr. Robert Vance",
                "role": "faculty",
                "department": "Computer Science & Engineering",
                "identifier": "FAC-CS-104",
                "phone": "+91 98765 00004",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            },
            {
                "id": "USR-STU-001",
                "email": settings.INITIAL_STUDENT_EMAIL,
                "password": settings.INITIAL_STUDENT_PASSWORD,
                "name": "Aarav Sharma",
                "role": "student",
                "department": "Computer Science Engineering",
                "identifier": "2023CSE042",
                "phone": "+91 98765 00005",
                "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
            },
            {
                "id": "USR-PAR-001",
                "email": settings.INITIAL_PARENT_EMAIL,
                "password": settings.INITIAL_PARENT_PASSWORD,
                "name": "Suresh Sharma",
                "role": "parent",
                "department": "Parent Association",
                "identifier": "PAR-2023CSE042",
                "phone": "+91 98765 00006",
                "child_name": "Aarav Sharma",
                "child_roll_no": "2023CSE042",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            }
        ]

        user_map = {}
        for u_data in seed_users_def:
            user_obj = db.query(User).filter(User.email == u_data["email"]).first()
            if not user_obj:
                user_obj = User(
                    id=u_data["id"],
                    full_name=u_data["name"],
                    email=u_data["email"],
                    password_hash=get_password_hash(u_data["password"]),
                    role_id=role_map[u_data["role"]].id,
                    department=u_data.get("department"),
                    identifier=u_data.get("identifier"),
                    phone=u_data.get("phone"),
                    child_name=u_data.get("child_name"),
                    child_roll_no=u_data.get("child_roll_no"),
                    avatar=u_data.get("avatar"),
                    status="active",
                    is_active=True,
                    is_verified=True
                )
                db.add(user_obj)
                db.flush()
            user_map[u_data["role"]] = user_obj

        db.commit()

        print("Seeding initial appointments...")
        if db.query(Appointment).count() == 0:
            apt1 = Appointment(
                id="APT-2026-1001",
                subject="Request for Academic Leave & International Seminar Attendance",
                category="Academic Leave Approval",
                description="Seeking permission to attend IEEE International Conference on AI in Hyderabad.",
                requested_by_id=user_map["student"].id,
                target_persona="Principal",
                preferred_date="2026-08-20",
                preferred_time="10:30 AM",
                priority=PriorityLevelEnum.High,
                status=AppointmentStatusEnum.PENDING_MEDIATOR
            )
            db.add(apt1)
            db.flush()

            h1 = AppointmentHistory(
                appointment_id=apt1.id,
                actor_name=user_map["student"].full_name,
                actor_role="student",
                action="Submitted Request",
                comment="Submitted online via Niyojan portal."
            )
            db.add(h1)

            apt2 = Appointment(
                id="APT-2026-1002",
                subject="Parent-Principal Interaction Regarding Campus Placement Drive",
                category="Placement Discussion",
                description="Discussion regarding upcoming campus recruitment drives and internship opportunities.",
                requested_by_id=user_map["parent"].id,
                target_persona="Principal",
                preferred_date="2026-08-22",
                preferred_time="02:00 PM",
                priority=PriorityLevelEnum.Medium,
                status=AppointmentStatusEnum.FORWARDED_TO_PRINCIPAL,
                mediator_remarks="Verified parent credentials and student academic records. Recommended for Principal meeting."
            )
            db.add(apt2)
            db.flush()

            h2_1 = AppointmentHistory(
                appointment_id=apt2.id,
                actor_name=user_map["parent"].full_name,
                actor_role="parent",
                action="Submitted Request",
                comment="Requested discussion regarding placement drive."
            )
            h2_2 = AppointmentHistory(
                appointment_id=apt2.id,
                actor_name=user_map["mediator"].full_name,
                actor_role="mediator",
                action="Reviewed & Forwarded to Principal",
                comment="Verified parent credentials and student academic records."
            )
            db.add_all([h2_1, h2_2])

        db.commit()

        print("Seeding initial documents...")
        if db.query(Document).count() == 0:
            doc1 = Document(
                id="DOC-2026-8812",
                doc_title="Bonafide Certificate Request for Passport Application",
                doc_category="Bonafide Certificate",
                submitted_by_id=user_map["student"].id,
                submitted_date="2026-08-14",
                file_path=os.path.join(settings.UPLOAD_DIR, "sample_bonafide.pdf"),
                file_size="2.4 MB",
                file_type="application/pdf",
                status=DocumentStatusEnum.PENDING_VERIFICATION,
                digital_stamp_verified=False
            )
            db.add(doc1)

        db.commit()

        print("Seeding principal availability...")
        if db.query(PrincipalAvailability).count() == 0:
            avail1 = PrincipalAvailability(
                date_str="2026-08-20",
                start_time="10:00 AM",
                end_time="01:00 PM",
                slot_duration_minutes=30,
                max_appointments=6,
                is_active=True
            )
            avail2 = PrincipalAvailability(
                date_str="2026-08-22",
                start_time="02:00 PM",
                end_time="05:00 PM",
                slot_duration_minutes=30,
                max_appointments=6,
                is_active=True
            )
            db.add_all([avail1, avail2])

        db.commit()

        print("Seeding initial audit log...")
        if db.query(AuditLog).count() == 0:
            log1 = AuditLog(
                id="LOG-INIT-001",
                timestamp=datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p"),
                actor_id=user_map["admin"].id,
                actor_name=user_map["admin"].full_name,
                actor_role="admin",
                action_type="SYSTEM_CONFIG",
                details="Initialized Niyojan institutional database and RBAC roles.",
                ip_address="127.0.0.1 (System Init)"
            )
            db.add(log1)

        db.commit()
        print("SUCCESS: Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
