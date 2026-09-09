from typing import Optional, List, Any
from pydantic import BaseModel
import datetime

class ChatStartRequest(BaseModel):
    case_id: int

class ChatMessageRequest(BaseModel):
    case_id: int
    content: str
    question_code: Optional[str] = None
    is_skip: Optional[bool] = False

class ChatMessageOut(BaseModel):
    id: int
    session_id: int
    role: str # assistant, user, system
    content: str
    step_number: int
    question_id: Optional[str] = None
    options: Optional[List[str]] = None
    input_type: Optional[str] = "text"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: int
    case_id: int
    current_step: int
    total_steps: int
    is_active: bool
    emergency_detected: bool = False
    messages: List[ChatMessageOut] = []
    extracted_facts: dict = {}
