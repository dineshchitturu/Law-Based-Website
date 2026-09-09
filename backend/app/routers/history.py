from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.history import History
from backend.app.routers.auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["History & Audit"])

class HistoryOut(BaseModel):
    id: int
    case_id: int | None = None
    action_type: str
    description: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[HistoryOut])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(History).filter(History.user_id == current_user.id).order_by(History.timestamp.desc()).limit(50).all()
    return items

@router.delete("/{id}")
def delete_history_item(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(History).filter(History.id == id, History.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History entry not found.")
    db.delete(item)
    db.commit()
    return {"message": "History entry deleted."}

@router.delete("/clear/all")
def clear_all_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(History).filter(History.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All history cleared."}
