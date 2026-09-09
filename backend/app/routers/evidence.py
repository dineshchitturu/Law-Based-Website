import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.models.history import History
from backend.app.schemas.evidence import EvidenceOut, EvidenceUpdate
from backend.app.routers.auth import get_current_user

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "png", "jpg", "jpeg", "webp", "gif",      # Photos / Screenshots
    "pdf", "doc", "docx", "txt", "csv",       # Documents
    "mp4", "mov", "avi", "mkv",               # Videos
    "mp3", "wav", "m4a", "ogg"                # Audio
}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 # 25 MB

@router.post("/upload", response_model=EvidenceOut)
async def upload_evidence(
    case_id: int = Form(...),
    file_type: str = Form("document"), # photo, video, audio, document, screenshot, other
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    # 1. Extension validation
    original_filename = file.filename or "uploaded_file"
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '.{ext}' is not permitted. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Read content & validate size
    content = await file.read()
    file_size = len(content)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds 25 MB limit ({round(file_size/(1024*1024), 2)} MB)."
        )

    # 3. Secure unique filename
    unique_prefix = uuid.uuid4().hex[:12]
    safe_name = f"{unique_prefix}_{original_filename.replace(' ', '_')}"
    destination_path = os.path.join(UPLOAD_DIR, safe_name)

    # Save to disk
    with open(destination_path, "wb") as f:
        f.write(content)

    # 4. Save Evidence record
    evidence_row = Evidence(
        case_id=case.id,
        user_id=current_user.id,
        original_filename=original_filename,
        stored_filename=safe_name,
        file_type=file_type,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        description=description or f"{file_type.title()} attached for case",
        file_url=f"/api/evidence/download/{safe_name}"
    )
    db.add(evidence_row)

    # Increment completeness score if evidence was missing
    if case.completeness_score < 90:
        case.completeness_score = min(95, case.completeness_score + 10)

    # History
    db.add(History(
        user_id=current_user.id,
        case_id=case.id,
        action_type="evidence_uploaded",
        description=f"Uploaded evidence '{original_filename}' ({file_type})."
    ))
    db.commit()
    db.refresh(evidence_row)

    return evidence_row

@router.get("/case/{case_id}", response_model=List[EvidenceOut])
def get_case_evidence(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    items = db.query(Evidence).filter(Evidence.case_id == case.id).order_by(Evidence.created_at.desc()).all()
    return items

@router.get("/all", response_model=List[EvidenceOut])
def get_all_user_evidence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Evidence).filter(Evidence.user_id == current_user.id).order_by(Evidence.created_at.desc()).all()
    return items

@router.get("/download/{filename}")
def download_evidence_file(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify file belongs to current user
    evidence = db.query(Evidence).filter(Evidence.stored_filename == filename, Evidence.user_id == current_user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="File not found or access unauthorized.")

    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file missing on server.")

    return FileResponse(file_path, filename=evidence.original_filename, media_type=evidence.mime_type)

@router.delete("/{id}")
def delete_evidence(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(Evidence.id == id, Evidence.user_id == current_user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence item not found.")

    # Remove physical file if present
    file_path = os.path.join(UPLOAD_DIR, evidence.stored_filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    db.delete(evidence)
    db.commit()
    return {"message": "Evidence removed successfully."}
