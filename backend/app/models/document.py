import enum
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class DocumentStatusEnum(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED_BY_MEDIATOR = "VERIFIED_BY_MEDIATOR"
    APPROVED_BY_PRINCIPAL = "APPROVED_BY_PRINCIPAL"
    REJECTED = "REJECTED"
    REVOKED = "REVOKED"

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True) # e.g. DOC-2026-8812
    doc_title: Mapped[str] = mapped_column(String(255), nullable=False)
    doc_category: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Bonafide Certificate, Fee Waiver, etc.
    
    submitted_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    submitted_date: Mapped[str] = mapped_column(String(20), nullable=False) # YYYY-MM-DD
    
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    approved_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_size: Mapped[str] = mapped_column(String(50), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    status: Mapped[DocumentStatusEnum] = mapped_column(SQLEnum(DocumentStatusEnum, native_enum=False), default=DocumentStatusEnum.PENDING_VERIFICATION, index=True)
    
    mediator_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    principal_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    digital_stamp_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    approval_reference_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, unique=True, index=True)
    
    document_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True) # SHA-256
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    blockchain_tx_hash: Mapped[Optional[str]] = mapped_column(String(66), nullable=True)
    blockchain_status: Mapped[str] = mapped_column(String(20), default="unanchored", nullable=False) # unanchored, pending, confirmed, failed
    verification_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True, index=True)
    qr_code_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    submitted_by = relationship("User", foreign_keys=[submitted_by_id], back_populates="documents_submitted")
    approval_record = relationship("DocumentApprovalRecord", back_populates="document", uselist=False, cascade="all, delete-orphan")

class DocumentApprovalRecord(Base):
    __tablename__ = "document_approval_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, unique=True)
    approval_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    approved_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    approved_by_name: Mapped[str] = mapped_column(String(150), nullable=False)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    verification_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    document_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    signature_metadata: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    document = relationship("Document", back_populates="approval_record")
