"""
AI Mail Agent API — Niyojan
=============================
Endpoints for generating and dispatching AI-written blockchain-audit emails.

POST /api/mail/generate
  - Auth: any authenticated user (approver typically)
  - Rate limit: 5 requests / 60s
  - Triggers Gemini AI agent to draft an email with the document's blockchain certificate

POST /api/mail/send/{document_id}
  - Auth: any authenticated user
  - Rate limit: 3 requests / 300s per IP
  - Generates + optionally dispatches via SMTP
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.core.rate_limiter import rate_limit
from app.models.document import Document
from app.models.appointment import Appointment
from app.models.user import User
from app.services.mail_agent_service import ai_mail_agent
from app.services.blockchain_service import blockchain_service

router = APIRouter(prefix="/mail", tags=["AI Mail Agent"])


class MailGenerateRequest(BaseModel):
    recipient_name: str = Field(..., description="Full name of the email recipient")
    recipient_email: EmailStr = Field(..., description="Recipient email address")
    document_id: str = Field(..., description="Niyojan document or appointment ID, e.g. DOC-2026-8812")
    purpose: str = Field(
        default="Document Approval Confirmation",
        description="Brief purpose statement for the email",
    )
    additional_notes: Optional[str] = Field(
        default="Please bring a valid government-issued photo ID when collecting your document.",
        description="Extra notes appended to the email body",
    )
    send_via_smtp: bool = Field(
        default=False,
        description="If true and SMTP_HOST is configured, the email is actually dispatched",
    )


class MailGenerateResponse(BaseModel):
    status: str
    delivery_status: str
    recipient: str
    agent_engine: str
    subject: str
    plain_text_preview: str
    html_preview_length: int


def _build_blockchain_record(doc_id: str, db: Session) -> dict:
    """Assembles the blockchain certificate dict from a Document or Appointment DB row."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        tx = getattr(doc, "blockchain_tx_hash", None) or ""
        sha = getattr(doc, "sha256_hash", None) or getattr(doc, "document_hash", None) or ""
        ecdsa_sig = getattr(doc, "ecdsa_signature", "")
        signer = getattr(doc, "signer_address", "")
        return {
            "document_id": doc_id,
            "document_sha256": sha,
            "tx_hash": tx,
            "ecdsa_signature": ecdsa_sig or "",
            "signer_address": signer or "",
            "network": "Polygon Amoy / Niyojan ECDSA Ledger",
            "explorer_url": blockchain_service.get_explorer_url(tx) or "",
        }

    apt = db.query(Appointment).filter(Appointment.id == doc_id).first()
    if apt:
        tx = getattr(apt, "blockchain_tx_hash", None) or ""
        sha = getattr(apt, "sha256_hash", None) or ""
        ecdsa_sig = getattr(apt, "ecdsa_signature", "")
        signer = getattr(apt, "signer_address", "")
        return {
            "document_id": doc_id,
            "document_sha256": sha,
            "tx_hash": tx,
            "ecdsa_signature": ecdsa_sig or "",
            "signer_address": signer or "",
            "network": "Polygon Amoy / Niyojan ECDSA Ledger",
            "explorer_url": blockchain_service.get_explorer_url(tx) or "",
        }

    # Fallback: query local ledger
    ledger = blockchain_service.get_local_ledger()
    local = ledger._by_doc_id.get(doc_id)
    if local:
        return {
            "document_id":   doc_id,
            "document_sha256": local.get("document_sha256", ""),
            "tx_hash":         local.get("tx_hash", ""),
            "ecdsa_signature": local.get("ecdsa_signature", ""),
            "signer_address":  local.get("signer_address", ""),
            "network":         local.get("network", "Niyojan Local ECDSA Ledger"),
            "explorer_url":    "",
        }

    # Nothing found — return stub so email still generates
    return {
        "document_id": doc_id,
        "document_sha256": "N/A",
        "tx_hash": "N/A",
        "ecdsa_signature": "",
        "signer_address": "N/A",
        "network": "N/A",
        "explorer_url": "",
    }


@router.post(
    "/generate",
    response_model=MailGenerateResponse,
    dependencies=[Depends(rate_limit(5, 60, "ai_mail_generate"))],
    summary="Generate an AI-written blockchain-certificate notification email",
)
def generate_mail(
    req: MailGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Uses Gemini 3.8 Flash to draft an official email containing the ECDSA blockchain
    audit certificate for a document or appointment.  Falls back to a deterministic
    HTML template when GEMINI_API_KEY is not set.
    """
    blockchain_record = _build_blockchain_record(req.document_id, db)

    payload = ai_mail_agent.generate(
        recipient_name=req.recipient_name,
        recipient_email=str(req.recipient_email),
        document_id=req.document_id,
        purpose=req.purpose,
        additional_notes=req.additional_notes or "",
        blockchain_record=blockchain_record,
    )

    delivery_status = "NOT_DISPATCHED"
    if req.send_via_smtp:
        delivery_status = ai_mail_agent.dispatch_smtp(
            to_email=str(req.recipient_email),
            payload=payload,
        )

    return MailGenerateResponse(
        status="success",
        delivery_status=delivery_status,
        recipient=str(req.recipient_email),
        agent_engine=payload.agent_engine,
        subject=payload.subject,
        plain_text_preview=payload.plain_text_body[:500],
        html_preview_length=len(payload.html_body),
    )


@router.get(
    "/preview/{document_id}",
    dependencies=[Depends(rate_limit(10, 60, "ai_mail_preview"))],
    summary="Preview AI-generated email for a document (returns full HTML)",
)
def preview_mail(
    document_id: str,
    recipient_name: str = "Applicant",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the full HTML body and subject for a generated email without dispatching."""
    blockchain_record = _build_blockchain_record(document_id, db)

    payload = ai_mail_agent.generate(
        recipient_name=recipient_name,
        recipient_email="preview@niyojan.gov.in",
        document_id=document_id,
        purpose="Document Approval",
        additional_notes="",
        blockchain_record=blockchain_record,
    )

    return {
        "document_id":  document_id,
        "subject":      payload.subject,
        "html_body":    payload.html_body,
        "plain_text":   payload.plain_text_body,
        "agent_engine": payload.agent_engine,
        "tone_used":    payload.tone_used,
    }
