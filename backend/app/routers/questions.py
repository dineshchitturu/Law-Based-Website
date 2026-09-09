from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.services.interview_engine import InterviewEngine

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.get("/{category}")
def get_questions_for_category(category: str):
    items = InterviewEngine.get_questions_for_category(category)
    return [
        {
            "code": q.code,
            "category": q.category,
            "text": q.text,
            "type": q.q_type,
            "options": q.options,
            "required": q.required,
            "target_fact": q.target_fact,
            "help_text": q.help_text
        }
        for q in items
    ]
