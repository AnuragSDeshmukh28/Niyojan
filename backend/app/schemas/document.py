from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class SubmittedByRead(BaseModel):
    id: str
    name: str
    role: str
    identifier: str
    avatar: str

class DocumentCreate(BaseModel):
    docTitle: str
    docCategory: str

class DocumentRead(BaseModel):
    id: str
    docTitle: str
    docCategory: str
    submittedBy: SubmittedByRead
    submittedDate: str
    fileSize: str
    fileType: str
    status: str
    mediatorNote: Optional[str] = None
    principalNote: Optional[str] = None
    digitalStampVerified: bool = False
    approvalReferenceNo: Optional[str] = None
    sha256_hash: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_status: Optional[str] = "unanchored"
    blockchain_explorer_url: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentReviewRequest(BaseModel):
    note: str

class DocumentVerificationResponse(BaseModel):
    status: str # AUTHENTIC, INVALID, REVOKED, NOT_FOUND
    verification_id: Optional[str] = None
    doc_title: Optional[str] = None
    doc_category: Optional[str] = None
    submitted_by: Optional[str] = None
    approved_by: Optional[str] = None
    approval_date: Optional[str] = None
    approval_reference_no: Optional[str] = None
    document_hash: Optional[str] = None
    sha256_hash: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_status: Optional[str] = "unanchored"
    blockchain_explorer_url: Optional[str] = None
    blockchain_issuer: Optional[str] = None
    blockchain_timestamp: Optional[int] = None
    blockchain_verified: bool = False
    hash_match: bool = False
    signature_valid: bool = False
    institution: str = "Niyojan Educational Institution"
