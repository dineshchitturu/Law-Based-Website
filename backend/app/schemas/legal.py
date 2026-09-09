from typing import Optional, List
from pydantic import BaseModel

class LegalActOut(BaseModel):
    id: str
    short_code: str
    title: str
    enacted_year: Optional[int] = None
    jurisdiction: str
    category: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None

    class Config:
        from_attributes = True

class LegalSectionOut(BaseModel):
    id: str
    act_id: str
    act_short_code: str
    section_number: str
    title: str
    category: str
    description: str
    simple_explanation: str
    punishment: Optional[str] = None
    bailable: Optional[str] = None
    cognizable: Optional[str] = None
    compoundable: Optional[str] = None
    keywords: List[str] = []
    source_url: Optional[str] = None
    last_verified: Optional[str] = None

    class Config:
        from_attributes = True

class LegalMatchOut(BaseModel):
    id: int
    case_id: int
    section: LegalSectionOut
    relevance_score: float
    reason_explanation: str
    matched_facts: List[str] = []

    class Config:
        from_attributes = True

class LegalAnalyzeRequest(BaseModel):
    case_id: int

class LegalAnalysisResponse(BaseModel):
    case_id: int
    status: str = "Preliminary Assessment"
    case_category: str
    completeness_score: int
    possible_legal_areas: List[str]
    possible_provisions: List[LegalMatchOut]
    information_used: List[str]
    information_still_needed: List[str]
    recommended_next_steps: List[str]
    disclaimer: str

class LegalSearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[LegalSectionOut]
