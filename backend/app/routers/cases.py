from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.case import Case, CaseFact
from backend.app.models.history import History
from backend.app.models.evidence import Evidence
from backend.app.models.legal import LegalMatch
from backend.app.models.document import GeneratedDocument
from backend.app.schemas.case import CaseCreate, CaseUpdate, CaseOut, CaseDetailOut, CaseFactOut
from backend.app.routers.auth import get_current_user
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/cases", tags=["Cases"])

@router.post("", response_model=CaseDetailOut)
def create_case(
    data: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If category is "I don't know" or empty, automatically classify via AI Service
    category = data.category
    if not category or category == "I don't know":
        category = ai_service.classify_case(data.initial_description)

    # Initial Fact Extraction
    facts_dict = ai_service.extract_facts(data.initial_description, category=category)
    emergency_detected = facts_dict.get("emergency_detected", False)

    # Create Case Title if not provided
    title = data.title
    if not title:
        obj = facts_dict.get("object_item", "Incident")
        title = f"{category} Report ({obj.title()})"

    new_case = Case(
        user_id=current_user.id,
        title=title,
        category=category,
        status="in_progress",
        initial_description=data.initial_description,
        incident_date=facts_dict.get("date_time"),
        incident_location=facts_dict.get("location"),
        complainant_name=data.complainant_name or current_user.full_name,
        loss_damage=facts_dict.get("amount") or facts_dict.get("object_item"),
        completeness_score=35,
        emergency_flag=emergency_detected
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Save extracted facts as CaseFact rows
    for key, val in facts_dict.items():
        if key not in ["emergency_detected", "category"] and val:
            fact_row = CaseFact(
                case_id=new_case.id,
                fact_key=key,
                fact_value=str(val),
                confidence=0.9,
                is_extracted=True,
                source="nlp"
            )
            db.add(fact_row)

    # Log user history
    db.add(History(
        user_id=current_user.id,
        case_id=new_case.id,
        action_type="case_created",
        description=f"Created case '{new_case.title}' under {new_case.category}."
    ))
    db.commit()

    # Query facts
    saved_facts = db.query(CaseFact).filter(CaseFact.case_id == new_case.id).all()

    return CaseDetailOut(
        id=new_case.id,
        user_id=new_case.user_id,
        title=new_case.title,
        category=new_case.category,
        status=new_case.status,
        initial_description=new_case.initial_description,
        incident_date=new_case.incident_date,
        incident_time=new_case.incident_time,
        incident_location=new_case.incident_location,
        complainant_name=new_case.complainant_name,
        suspect_info=new_case.suspect_info,
        loss_damage=new_case.loss_damage,
        completeness_score=new_case.completeness_score,
        emergency_flag=new_case.emergency_flag,
        created_at=new_case.created_at,
        updated_at=new_case.updated_at,
        facts=[CaseFactOut.from_orm(f) for f in saved_facts],
        evidence_count=0,
        legal_matches_count=0,
        documents_count=0
    )

@router.get("", response_model=List[CaseOut])
def list_cases(
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Case).filter(Case.user_id == current_user.id)
    if status and status != "all":
        query = query.filter(Case.status == status)
    if category and category != "all":
        query = query.filter(Case.category == category)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(Case.title.ilike(search_fmt) | Case.initial_description.ilike(search_fmt))

    cases = query.order_by(Case.created_at.desc()).all()
    return cases

@router.get("/{id}", response_model=CaseDetailOut)
def get_case_detail(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts = db.query(CaseFact).filter(CaseFact.case_id == case.id).all()
    evidence_count = db.query(Evidence).filter(Evidence.case_id == case.id).count()
    matches_count = db.query(LegalMatch).filter(LegalMatch.case_id == case.id).count()
    documents_count = db.query(GeneratedDocument).filter(GeneratedDocument.case_id == case.id).count()

    return CaseDetailOut(
        id=case.id,
        user_id=case.user_id,
        title=case.title,
        category=case.category,
        status=case.status,
        initial_description=case.initial_description,
        incident_date=case.incident_date,
        incident_time=case.incident_time,
        incident_location=case.incident_location,
        complainant_name=case.complainant_name,
        suspect_info=case.suspect_info,
        loss_damage=case.loss_damage,
        completeness_score=case.completeness_score,
        emergency_flag=case.emergency_flag,
        created_at=case.created_at,
        updated_at=case.updated_at,
        facts=[CaseFactOut.from_orm(f) for f in facts],
        evidence_count=evidence_count,
        legal_matches_count=matches_count,
        documents_count=documents_count
    )

@router.put("/{id}", response_model=CaseOut)
def update_case(
    id: int,
    data: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    if data.title is not None:
        case.title = data.title
    if data.category is not None:
        case.category = data.category
    if data.status is not None:
        case.status = data.status
    if data.incident_date is not None:
        case.incident_date = data.incident_date
    if data.incident_time is not None:
        case.incident_time = data.incident_time
    if data.incident_location is not None:
        case.incident_location = data.incident_location
    if data.complainant_name is not None:
        case.complainant_name = data.complainant_name
    if data.suspect_info is not None:
        case.suspect_info = data.suspect_info
    if data.loss_damage is not None:
        case.loss_damage = data.loss_damage
    if data.completeness_score is not None:
        case.completeness_score = data.completeness_score

    db.commit()
    db.refresh(case)
    return case

@router.delete("/{id}")
def delete_case(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    db.delete(case)
    db.commit()
    return {"message": "Case deleted successfully."}
