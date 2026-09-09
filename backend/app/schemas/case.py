from typing import Optional, List, Any
from pydantic import BaseModel
import datetime

class CaseFactCreate(BaseModel):
    fact_key: str
    fact_value: str
    confidence: Optional[float] = 1.0
    source: Optional[str] = "user_edit"

class CaseFactOut(BaseModel):
    id: int
    case_id: int
    fact_key: str
    fact_value: str
    confidence: float
    is_extracted: bool
    source: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CaseCreate(BaseModel):
    title: Optional[str] = None
    category: str # Cyber Fraud, Theft, Assault / Injury, Property Dispute, Consumer Problem, Other, or "I don't know"
    initial_description: str
    complainant_name: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None
    incident_location: Optional[str] = None
    complainant_name: Optional[str] = None
    suspect_info: Optional[str] = None
    loss_damage: Optional[str] = None
    completeness_score: Optional[int] = None

class CaseOut(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    status: str
    initial_description: Optional[str] = None
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None
    incident_location: Optional[str] = None
    complainant_name: Optional[str] = None
    suspect_info: Optional[str] = None
    loss_damage: Optional[str] = None
    completeness_score: int
    emergency_flag: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class CaseDetailOut(CaseOut):
    facts: List[CaseFactOut] = []
    evidence_count: int = 0
    legal_matches_count: int = 0
    documents_count: int = 0
