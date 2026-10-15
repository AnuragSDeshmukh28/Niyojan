from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.rate_limiter import rate_limit
from app.schemas.document import DocumentVerificationResponse
from app.services.document_service import public_verify_document

router = APIRouter(prefix="/public", tags=["Public Verification"])

@router.get(
    "/verify/{verification_id}",
    response_model=DocumentVerificationResponse,
    dependencies=[Depends(rate_limit(30, 60, "public_verify"))],
)
def verify_document_public(verification_id: str, db: Session = Depends(get_db)):
    return public_verify_document(db, verification_id)
