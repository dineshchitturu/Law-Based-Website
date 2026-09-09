from backend.app.routers.auth import router as auth_router
from backend.app.routers.cases import router as cases_router
from backend.app.routers.chat import router as chat_router
from backend.app.routers.questions import router as questions_router
from backend.app.routers.evidence import router as evidence_router
from backend.app.routers.legal import router as legal_router
from backend.app.routers.documents import router as documents_router
from backend.app.routers.history import router as history_router
from backend.app.routers.resources import router as resources_router

__all__ = [
    "auth_router",
    "cases_router",
    "chat_router",
    "questions_router",
    "evidence_router",
    "legal_router",
    "documents_router",
    "history_router",
    "resources_router"
]
