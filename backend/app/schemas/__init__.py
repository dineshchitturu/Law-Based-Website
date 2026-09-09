from backend.app.schemas.auth import UserCreate, UserLogin, UserUpdate, UserOut, Token
from backend.app.schemas.case import CaseCreate, CaseUpdate, CaseFactCreate, CaseFactOut, CaseOut, CaseDetailOut
from backend.app.schemas.chat import ChatStartRequest, ChatMessageRequest, ChatMessageOut, ChatSessionOut
from backend.app.schemas.evidence import EvidenceOut, EvidenceUpdate
from backend.app.schemas.legal import LegalActOut, LegalSectionOut, LegalMatchOut, LegalAnalyzeRequest, LegalAnalysisResponse, LegalSearchResponse
from backend.app.schemas.document import DocumentGenerateRequest, GeneratedDocumentOut, CaseReportOut

__all__ = [
    "UserCreate", "UserLogin", "UserUpdate", "UserOut", "Token",
    "CaseCreate", "CaseUpdate", "CaseFactCreate", "CaseFactOut", "CaseOut", "CaseDetailOut",
    "ChatStartRequest", "ChatMessageRequest", "ChatMessageOut", "ChatSessionOut",
    "EvidenceOut", "EvidenceUpdate",
    "LegalActOut", "LegalSectionOut", "LegalMatchOut", "LegalAnalyzeRequest", "LegalAnalysisResponse", "LegalSearchResponse",
    "DocumentGenerateRequest", "GeneratedDocumentOut", "CaseReportOut"
]
