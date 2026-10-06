import os
import uuid
import hashlib
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
}

def validate_and_save_upload(file: UploadFile) -> Tuple[str, str, str, str]:
    if not file.content_type or file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed types: PDF, PNG, JPG, JPEG"
        )
    
    extension = ALLOWED_MIME_TYPES[file.content_type.lower()]
    
    # Read file content safely
    content = file.file.read()
    file_size_mb = len(content) / (1024 * 1024)
    
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
        
    # Format size string (e.g. "2.4 MB" or "450 KB")
    if len(content) >= 1024 * 1024:
        size_str = f"{len(content) / (1024 * 1024):.1f} MB"
    else:
        size_str = f"{len(content) / 1024:.0f} KB"
        
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    return file_path, unique_filename, size_str, file.content_type

def compute_file_sha256(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest().upper()
