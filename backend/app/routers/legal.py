import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.case import Case, CaseFact
from backend.app.models.evidence import Evidence
from backend.app.models.legal import LegalAct, LegalSection, LegalMatch
from backend.app.models.document import CaseReport
from backend.app.models.history import History
from backend.app.schemas.legal import (
    LegalAnalyzeRequest, LegalAnalysisResponse, LegalMatchOut,
    LegalSectionOut, LegalActOut, LegalSearchResponse
)
from backend.app.routers.auth import get_current_user
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/legal", tags=["Legal Analysis & Knowledge Base"])

LEGAL_DISCLAIMER = (
    "LawBot AI provides legal information and case-preparation assistance. "
    "It does NOT provide formal legal advice or replace a qualified lawyer or competent judicial authority. "
    "Provisions listed are potentially relevant indicators based on the information provided."
)

@router.post("/analyze", response_model=LegalAnalysisResponse)
def analyze_case_legal(
    data: LegalAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == data.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    # 1. Gather all case facts
    facts_rows = db.query(CaseFact).filter(CaseFact.case_id == case.id).all()
    facts_map = {f.fact_key: f.fact_value for f in facts_rows}
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    # 2. Run deterministic Legal Matcher
    matched_data = ai_service.match_legal_provisions(
        db=db,
        category=case.category,
        facts=facts_map,
        has_evidence=len(evidence_items) > 0
    )

    # 3. Clear existing matches for fresh analysis
    db.query(LegalMatch).filter(LegalMatch.case_id == case.id).delete()

    saved_matches = []
    possible_areas = set()
    for m in matched_data:
        sec = m["section"]
        possible_areas.add(f"{sec.act_short_code} ({sec.category})")
        match_record = LegalMatch(
            case_id=case.id,
            section_id=sec.id,
            relevance_score=m["relevance_score"],
            reason_explanation=m["reason_explanation"],
            matched_facts_json=json.dumps(m["matched_facts"])
        )
        db.add(match_record)
        saved_matches.append((match_record, sec, m["matched_facts"]))

    # 4. Run Case Completeness Analyzer
    score, used_items, needed_items, next_steps = ai_service.calculate_case_readiness(
        case.category, facts_map, evidence_count=len(evidence_items)
    )
    case.completeness_score = score
    case.status = "ready_for_review"

    # 5. Save or update CaseReport
    report = db.query(CaseReport).filter(CaseReport.case_id == case.id).first()
    summary_text = ai_service.generate_case_summary(
        case_info={"title": case.title, "category": case.category, "status": case.status, "initial_description": case.initial_description, "completeness_score": score},
        facts=facts_map,
        evidence_list=[{"original_filename": e.original_filename, "file_type": e.file_type, "description": e.description} for e in evidence_items],
        legal_matches=matched_data
    )
    if not report:
        report = CaseReport(
            case_id=case.id,
            summary_text=summary_text,
            completeness_score=score,
            used_facts_json=json.dumps(used_items),
            missing_facts_json=json.dumps(needed_items),
            recommended_steps_json=json.dumps(next_steps)
        )
        db.add(report)
    else:
        report.summary_text = summary_text
        report.completeness_score = score
        report.used_facts_json = json.dumps(used_items)
        report.missing_facts_json = json.dumps(needed_items)
        report.recommended_steps_json = json.dumps(next_steps)

    # History
    db.add(History(
        user_id=current_user.id,
        case_id=case.id,
        action_type="analysis_run",
        description=f"Generated preliminary legal analysis: {len(saved_matches)} possible provisions identified."
    ))
    db.commit()

    # Format response
    provisions_out = []
    for m_rec, sec, m_facts in saved_matches:
        sec_out = _format_section_out(sec)
        provisions_out.append(LegalMatchOut(
            id=m_rec.id,
            case_id=case.id,
            section=sec_out,
            relevance_score=m_rec.relevance_score,
            reason_explanation=m_rec.reason_explanation,
            matched_facts=m_facts
        ))

    return LegalAnalysisResponse(
        case_id=case.id,
        status="Preliminary Assessment",
        case_category=case.category,
        completeness_score=score,
        possible_legal_areas=list(possible_areas),
        possible_provisions=provisions_out,
        information_used=used_items,
        information_still_needed=needed_items,
        recommended_next_steps=next_steps,
        disclaimer=LEGAL_DISCLAIMER
    )

@router.get("/search", response_model=LegalSearchResponse)
def search_laws(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    query_str = f"%{q.lower()}%"
    sections = db.query(LegalSection).filter(
        LegalSection.section_number.ilike(query_str) |
        LegalSection.title.ilike(query_str) |
        LegalSection.simple_explanation.ilike(query_str) |
        LegalSection.keywords_json.ilike(query_str) |
        LegalSection.act_short_code.ilike(query_str)
    ).all()

    formatted = [_format_section_out(s) for s in sections]
    return LegalSearchResponse(
        query=q,
        total_results=len(formatted),
        results=formatted
    )

@router.get("/section/{id}", response_model=LegalSectionOut)
def get_section_details(id: str, db: Session = Depends(get_db)):
    sec = db.query(LegalSection).filter(LegalSection.id == id).first()
    if not sec:
        raise HTTPException(status_code=404, detail="Legal provision not found.")
    return _format_section_out(sec)

@router.get("/acts", response_model=List[LegalActOut])
def get_acts(db: Session = Depends(get_db)):
    acts = db.query(LegalAct).all()
    return acts

def _format_section_out(sec: LegalSection) -> LegalSectionOut:
    kws = []
    if sec.keywords_json:
        try:
            kws = json.loads(sec.keywords_json)
        except Exception:
            kws = []
    return LegalSectionOut(
        id=sec.id,
        act_id=sec.act_id,
        act_short_code=sec.act_short_code,
        section_number=sec.section_number,
        title=sec.title,
        category=sec.category,
        description=sec.description,
        simple_explanation=sec.simple_explanation,
        punishment=sec.punishment,
        bailable=sec.bailable,
        cognizable=sec.cognizable,
        compoundable=sec.compoundable,
        keywords=kws,
        source_url=sec.source_url,
        last_verified=sec.last_verified
    )
