from typing import Optional, List
from pydantic import BaseModel
import datetime

class DocumentGenerateRequest(BaseModel):
    case_id: int
    doc_type: str # police_complaint, consumer_notice, cybercrime_report, incident_statement, evidence_list, chronology
    recipient_authority: Optional[str] = None
    custom_notes: Optional[str] = None

class GeneratedDocumentOut(BaseModel):
    id: int
    case_id: int
    doc_type: str
    title: str
    content_markdown: str
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class CaseReportOut(BaseModel):
    id: int
    case_id: int
    summary_text: str
    completeness_score: int
    used_facts: List[str] = []
    missing_facts: List[str] = []
    recommended_steps: List[str] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True
