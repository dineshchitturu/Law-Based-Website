import os
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.services.fact_extractor import FactExtractor
from backend.app.services.interview_engine import InterviewEngine, QuestionItem
from backend.app.services.legal_matcher import LegalMatcher
from backend.app.services.case_analyzer import CaseAnalyzer
from backend.app.services.document_generator import DocumentGenerator

class AIService:
    """
    Central AI & Legal Intelligence orchestrator.
    Combines rule-based deterministic legal engineering with support for future
    RAG / LLM enhancement via AI_PROVIDER, AI_API_KEY, AI_MODEL.
    """

    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "deterministic_rules")
        self.api_key = os.getenv("AI_API_KEY", "")
        self.model = os.getenv("AI_MODEL", "gemini-1.5-flash")

    def classify_case(self, text: str) -> str:
        return FactExtractor.classify_category(text)

    def extract_facts(self, text: str, category: Optional[str] = None) -> Dict[str, Any]:
        return FactExtractor.extract_facts(text, existing_category=category)

    def get_next_question(
        self,
        category: str,
        known_facts: Dict[str, Any],
        answered_codes: List[str]
    ) -> Optional[QuestionItem]:
        return InterviewEngine.get_next_question(category, known_facts, answered_codes)

    def match_legal_provisions(
        self,
        db: Session,
        category: str,
        facts: Dict[str, Any],
        has_evidence: bool = False
    ) -> List[Dict[str, Any]]:
        return LegalMatcher.match_provisions(db, category, facts, has_evidence)

    def calculate_case_readiness(
        self,
        category: str,
        facts: Dict[str, Any],
        evidence_count: int = 0
    ):
        return CaseAnalyzer.calculate_readiness(category, facts, evidence_count)

    def generate_document(
        self,
        doc_type: str,
        case_info: Dict[str, Any],
        facts: Dict[str, Any],
        evidence_list: List[Dict[str, Any]],
        complainant_profile: Dict[str, Any]
    ) -> Dict[str, str]:
        return DocumentGenerator.generate_draft(doc_type, case_info, facts, evidence_list, complainant_profile)

    def generate_case_summary(
        self,
        case_info: Dict[str, Any],
        facts: Dict[str, Any],
        evidence_list: List[Dict[str, Any]],
        legal_matches: List[Dict[str, Any]]
    ) -> str:
        provisions_str = "\n".join([f"- **{m['section'].act_short_code} Section {m['section'].section_number}** ({m['section'].title}): {m['reason_explanation']}" for m in legal_matches]) or "- Pending preliminary analysis"
        evidence_str = "\n".join([f"- {e.get('original_filename')} ({e.get('file_type')}): {e.get('description', '')}" for e in evidence_list]) or "- No evidence attached yet."

        summary = f"""# STRUCTURED CASE SUMMARY DOSSIER

### Case Title: {case_info.get('title')}
**Category:** {case_info.get('category')}  
**Status:** {case_info.get('status', 'Preliminary Assessment')}  
**Date of Record:** {case_info.get('created_at', 'Today')}  

---

### 1. Incident Facts Overview
- **What happened:** {case_info.get('initial_description')}
- **Date & Time:** {facts.get('date_time', case_info.get('incident_date', 'N/A'))}
- **Location:** {facts.get('location', case_info.get('incident_location', 'N/A'))}
- **Loss / Property Involved:** {facts.get('object_item', facts.get('amount', case_info.get('loss_damage', 'N/A')))}
- **Suspect Information:** {facts.get('suspect_identified', 'Unknown / Unspecified')}

---

### 2. Potential Relevant Statutory Provisions
*(Informational only — Not a judicial decision)*
{provisions_str}

---

### 3. Evidentiary Material Attached
{evidence_str}

---

### 4. Completeness Evaluation
- **Information Collected Completeness:** {case_info.get('completeness_score', 50)}%
*(Note: Measures documentation completeness only, not legal outcome probability)*
"""
        return summary

ai_service = AIService()
