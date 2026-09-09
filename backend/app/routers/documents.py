import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.case import Case, CaseFact
from backend.app.models.evidence import Evidence
from backend.app.models.document import GeneratedDocument, CaseReport
from backend.app.models.history import History
from backend.app.schemas.document import DocumentGenerateRequest, GeneratedDocumentOut, CaseReportOut
from backend.app.routers.auth import get_current_user
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/documents", tags=["Documents & Drafts"])

@router.post("/generate", response_model=GeneratedDocumentOut)
def generate_document_draft(
    data: DocumentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == data.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts_rows = db.query(CaseFact).filter(CaseFact.case_id == case.id).all()
    facts_map = {f.fact_key: f.fact_value for f in facts_rows}
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    doc_draft = ai_service.generate_document(
        doc_type=data.doc_type,
        case_info={
            "title": case.title,
            "category": case.category,
            "initial_description": case.initial_description,
            "incident_date": case.incident_date,
            "incident_location": case.incident_location,
            "loss_damage": case.loss_damage,
            "complainant_name": case.complainant_name
        },
        facts=facts_map,
        evidence_list=[
            {
                "original_filename": e.original_filename,
                "file_type": e.file_type,
                "file_size": e.file_size,
                "description": e.description
            }
            for e in evidence_items
        ],
        complainant_profile={
            "full_name": current_user.full_name,
            "phone_number": current_user.phone_number,
            "city": current_user.city
        }
    )

    # Save to generated_documents
    doc_row = GeneratedDocument(
        case_id=case.id,
        doc_type=data.doc_type,
        title=doc_draft["title"],
        content_markdown=doc_draft["content_markdown"],
        status="draft"
    )
    db.add(doc_row)

    # History
    db.add(History(
        user_id=current_user.id,
        case_id=case.id,
        action_type="draft_generated",
        description=f"Generated draft '{doc_row.title}'."
    ))
    db.commit()
    db.refresh(doc_row)

    return doc_row

@router.get("/case/{case_id}", response_model=List[GeneratedDocumentOut])
def get_case_documents(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    docs = db.query(GeneratedDocument).filter(GeneratedDocument.case_id == case.id).order_by(GeneratedDocument.created_at.desc()).all()
    return docs

@router.get("/{id}", response_model=GeneratedDocumentOut)
def get_document(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(GeneratedDocument).filter(GeneratedDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.put("/{id}", response_model=GeneratedDocumentOut)
def update_document(
    id: int,
    content_markdown: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(GeneratedDocument).filter(GeneratedDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc.content_markdown = content_markdown
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/report/{case_id}", response_model=CaseReportOut)
def get_case_report(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    report = db.query(CaseReport).filter(CaseReport.case_id == case.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Case summary report not generated yet. Please run Legal Analysis first.")

    used = json.loads(report.used_facts_json) if report.used_facts_json else []
    needed = json.loads(report.missing_facts_json) if report.missing_facts_json else []
    steps = json.loads(report.recommended_steps_json) if report.recommended_steps_json else []

    return CaseReportOut(
        id=report.id,
        case_id=report.case_id,
        summary_text=report.summary_text,
        completeness_score=report.completeness_score,
        used_facts=used,
        missing_facts=needed,
        recommended_steps=steps,
        created_at=report.created_at
    )
