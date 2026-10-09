import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentRead
from app.services.document_service import upload_document, format_document_response

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentRead])
def list_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    user_role = current_user.role.name.value
    if user_role in ["student", "parent", "faculty"]:
        query = query.filter(Document.submitted_by_id == current_user.id)

    docs = query.order_by(Document.created_at.desc()).all()
    return [format_document_response(d) for d in docs]

@router.post("/upload", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def upload_new_document(
    background_tasks: BackgroundTasks,
    docTitle: str = Form(...),
    docCategory: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return upload_document(db, current_user, docTitle, docCategory, file, background_tasks=background_tasks)

@router.get("/{document_id}", response_model=DocumentRead)
def get_document_detail(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    user_role = current_user.role.name.value
    if user_role in ["student", "parent", "faculty"] and doc.submitted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this document")

    return format_document_response(doc)

@router.get("/{document_id}/download")
def download_document_file(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    user_role = current_user.role.name.value
    if user_role in ["student", "parent", "faculty"] and doc.submitted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this document file")

    target_file = doc.approved_file_path or doc.file_path
    if not os.path.exists(target_file):
        raise HTTPException(status_code=404, detail="Physical document file missing on server")

    filename = os.path.basename(target_file)
    return FileResponse(path=target_file, filename=filename, media_type=doc.file_type)
