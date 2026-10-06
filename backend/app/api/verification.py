from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.document import DocumentVerificationResponse
from app.services.document_service import public_verify_document

router = APIRouter(prefix="/public", tags=["Public Verification"])

@router.get("/verify/{verification_id}", response_model=DocumentVerificationResponse)
def verify_document_public(verification_id: str, db: Session = Depends(get_db)):
    return public_verify_document(db, verification_id)
