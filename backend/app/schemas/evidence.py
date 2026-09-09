from typing import Optional
from pydantic import BaseModel
import datetime

class EvidenceOut(BaseModel):
    id: int
    case_id: int
    user_id: int
    original_filename: str
    stored_filename: str
    file_type: str # photo, video, audio, document, screenshot, other
    file_size: int
    mime_type: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class EvidenceUpdate(BaseModel):
    description: Optional[str] = None
    file_type: Optional[str] = None
