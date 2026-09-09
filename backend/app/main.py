import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.database.session import Base, engine
from backend.app.seed_data import seed_database
from backend.app.routers import (
    auth_router,
    cases_router,
    chat_router,
    questions_router,
    evidence_router,
    legal_router,
    documents_router,
    history_router,
    resources_router
)

app = FastAPI(
    title="LawBot AI — Legal Information & Case Assistant",
    description="Public citizen-centric legal intake, adaptive question assistant, and case preparation platform.",
    version="1.0.0"
)

# CORS configuration for modern web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to ensure schema is synchronized and demo/legal data is seeded
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()

# Mount API routers
app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(chat_router)
app.include_router(questions_router)
app.include_router(evidence_router)
app.include_router(legal_router)
app.include_router(documents_router)
app.include_router(history_router)
app.include_router(resources_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LawBot AI Legal Information & Case Assistant",
        "version": "1.0.0",
        "jurisdiction": "India",
        "supported_acts": [
            "Bharatiya Nyaya Sanhita, 2023",
            "Bharatiya Nagarik Suraksha Sanhita, 2023",
            "Bharatiya Sakshya Adhiniyam, 2023",
            "Information Technology Act, 2000",
            "Consumer Protection Act, 2019"
        ]
    }
