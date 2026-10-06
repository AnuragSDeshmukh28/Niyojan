import os
import random
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile

from app.models.document import Document, DocumentApprovalRecord, DocumentStatusEnum
from app.models.user import User
from app.utils.file_security import validate_and_save_upload, compute_file_sha256
from app.utils.qr_generator import generate_verification_qr_code
from app.utils.pdf_generator import generate_signed_approval_pdf
from app.services.notification_service import create_notification
from app.services.audit_service import log_audit_event
from app.core.config import settings

def format_document_response(doc: Document) -> dict:
    sub_user = doc.submitted_by
    submitted_by_dict = {
        "id": sub_user.id if sub_user else "N/A",
        "name": sub_user.full_name if sub_user else "Unknown Submitter",
        "role": sub_user.role.name.value if sub_user else "student",
        "identifier": sub_user.identifier if sub_user else "",
        "avatar": sub_user.avatar if sub_user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    }

    return {
        "id": doc.id,
        "docTitle": doc.doc_title,
        "docCategory": doc.doc_category,
        "submittedBy": submitted_by_dict,
        "submittedDate": doc.submitted_date,
        "fileSize": doc.file_size,
        "fileType": doc.file_type,
        "status": doc.status.value,
        "mediatorNote": doc.mediator_note,
        "principalNote": doc.principal_note,
        "digitalStampVerified": doc.digital_stamp_verified,
        "approvalReferenceNo": doc.approval_reference_no
    }

def upload_document(db: Session, user: User, doc_title: str, doc_category: str, file: UploadFile) -> dict:
    file_path, filename, size_str, content_type = validate_and_save_upload(file)
    
    year = datetime.now().year
    rand_num = random.randint(1000, 9999)
    doc_id = f"DOC-{year}-{rand_num}"
    submitted_date_str = datetime.now().strftime("%Y-%m-%d")

    new_doc = Document(
        id=doc_id,
        doc_title=doc_title,
        doc_category=doc_category,
        submitted_by_id=user.id,
        submitted_date=submitted_date_str,
        file_path=file_path,
        file_size=size_str,
        file_type=content_type,
        status=DocumentStatusEnum.PENDING_VERIFICATION,
        digital_stamp_verified=False
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    create_notification(
        db=db,
        recipient_id=user.id,
        title="Document Uploaded Successfully",
        message=f"Document '{doc_title}' ({doc_id}) uploaded for Mediator verification.",
        notif_type="info",
        related_id=doc_id,
        related_type="document"
    )

    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action_type="DOCUMENT_UPLOAD",
        details=f"Uploaded document {doc_id}: '{doc_title}'"
    )

    return format_document_response(new_doc)

def verify_document_by_mediator(db: Session, mediator_user: User, document_id: str, note: str) -> dict:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = DocumentStatusEnum.VERIFIED_BY_MEDIATOR
    doc.mediator_note = note
    doc.digital_stamp_verified = True
    doc.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(doc)

    log_audit_event(
        db=db,
        actor_id=mediator_user.id,
        actor_name=mediator_user.full_name,
        actor_role=mediator_user.role.name.value,
        action_type="VERIFY_DOCUMENT",
        details=f"Verified document {document_id}. Marked with Mediator Seal."
    )

    return format_document_response(doc)

def approve_document_by_principal(db: Session, principal_user: User, document_id: str, note: str) -> dict:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Generate reference number & verification ID
    short_code = document_id.replace("DOC-", "")
    ref_no = f"NIY/{short_code}/{random.randint(1000, 9999)}"
    verification_id = f"NIY-{uuid.uuid4().hex[:6].upper()}"

    # Generate QR Code
    qr_code_path = generate_verification_qr_code(verification_id)

    # Generate Signed PDF
    approved_file_path = generate_signed_approval_pdf(
        original_file_path=doc.file_path,
        doc_title=doc.doc_title,
        doc_category=doc.doc_category,
        submitted_by_name=doc.submitted_by.full_name,
        submitted_by_identifier=doc.submitted_by.identifier or "N/A",
        approved_by_name=principal_user.full_name,
        approval_ref_no=ref_no,
        verification_id=verification_id,
        qr_code_path=qr_code_path,
        principal_note=note
    )

    # Compute SHA-256 hash of final approved PDF
    doc_hash = compute_file_sha256(approved_file_path)

    # Update Document Model
    doc.status = DocumentStatusEnum.APPROVED_BY_PRINCIPAL
    doc.principal_note = note
    doc.digital_stamp_verified = True
    doc.approval_reference_no = ref_no
    doc.document_hash = doc_hash
    doc.verification_id = verification_id
    doc.approved_file_path = approved_file_path
    doc.qr_code_path = qr_code_path
    doc.updated_at = datetime.now(timezone.utc)

    # Create immutable Approval Record
    app_record = DocumentApprovalRecord(
        document_id=doc.id,
        approval_id=f"APPR-{uuid.uuid4().hex[:8]}",
        approved_by_id=principal_user.id,
        approved_by_name=principal_user.full_name,
        approved_at=datetime.now(timezone.utc),
        verification_id=verification_id,
        document_hash=doc_hash,
        signature_metadata=f"Signed by {principal_user.full_name} via PyHanko/ReportLab Digital Seal Engine",
        is_revoked=False
    )
    db.add(app_record)

    db.commit()
    db.refresh(doc)

    create_notification(
        db=db,
        recipient_id=doc.submitted_by_id,
        title="Document Signed & Approved",
        message=f"Principal counter-signed {doc.id}. Official digital reference: {ref_no}",
        notif_type="success",
        related_id=doc.id,
        related_type="document"
    )

    log_audit_event(
        db=db,
        actor_id=principal_user.id,
        actor_name=principal_user.full_name,
        actor_role=principal_user.role.name.value,
        action_type="PRINCIPAL_APPROVE_DOCUMENT",
        details=f"Counter-signed document {doc.id}. Generated verification ID {verification_id}"
    )

    return format_document_response(doc)

def revoke_document(db: Session, user: User, document_id: str, reason: str) -> dict:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = DocumentStatusEnum.REVOKED
    doc.updated_at = datetime.now(timezone.utc)

    if doc.approval_record:
        doc.approval_record.is_revoked = True

    db.commit()
    db.refresh(doc)

    create_notification(
        db=db,
        recipient_id=doc.submitted_by_id,
        title="Document Revoked",
        message=f"Official approval for document '{doc.doc_title}' ({doc.id}) has been revoked. Reason: {reason}",
        notif_type="urgent",
        related_id=doc.id,
        related_type="document"
    )

    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_name=user.full_name,
        actor_role=user.role.name.value,
        action_type="DOCUMENT_REVOCATION",
        details=f"Revoked approval for document {doc.id}. Reason: '{reason}'"
    )

    return format_document_response(doc)

def public_verify_document(db: Session, verification_id: str) -> dict:
    doc = db.query(Document).filter(Document.verification_id == verification_id).first()
    if not doc:
        return {
            "status": "NOT_FOUND",
            "verification_id": verification_id,
            "hash_match": False,
            "signature_valid": False,
            "institution": settings.INSTITUTION_NAME
        }

    if doc.status == DocumentStatusEnum.REVOKED or (doc.approval_record and doc.approval_record.is_revoked):
        return {
            "status": "REVOKED",
            "verification_id": verification_id,
            "doc_title": doc.doc_title,
            "doc_category": doc.doc_category,
            "submitted_by": doc.submitted_by.full_name if doc.submitted_by else "Unknown",
            "approved_by": doc.approval_record.approved_by_name if doc.approval_record else "Principal",
            "approval_date": doc.approval_record.approved_at.strftime("%B %d, %Y") if doc.approval_record else doc.submitted_date,
            "approval_reference_no": doc.approval_reference_no,
            "document_hash": doc.document_hash,
            "hash_match": False,
            "signature_valid": False,
            "institution": settings.INSTITUTION_NAME
        }

    # Recalculate SHA-256 hash of stored file to detect tampering
    target_path = doc.approved_file_path or doc.file_path
    current_hash = compute_file_sha256(target_path) if os.path.exists(target_path) else doc.document_hash
    hash_matches = (current_hash == doc.document_hash)

    status_str = "AUTHENTIC" if hash_matches else "INVALID"

    return {
        "status": status_str,
        "verification_id": verification_id,
        "doc_title": doc.doc_title,
        "doc_category": doc.doc_category,
        "submitted_by": doc.submitted_by.full_name if doc.submitted_by else "Unknown",
        "approved_by": doc.approval_record.approved_by_name if doc.approval_record else "Principal",
        "approval_date": doc.approval_record.approved_at.strftime("%B %d, %Y") if doc.approval_record else doc.submitted_date,
        "approval_reference_no": doc.approval_reference_no,
        "document_hash": doc.document_hash,
        "hash_match": hash_matches,
        "signature_valid": doc.digital_stamp_verified and hash_matches,
        "institution": settings.INSTITUTION_NAME
    }
