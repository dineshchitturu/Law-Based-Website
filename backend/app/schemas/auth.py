from typing import Optional
from pydantic import BaseModel
import datetime

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    language_pref: Optional[str] = "en"
    text_size_pref: Optional[str] = "normal"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    language_pref: Optional[str] = None
    text_size_pref: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    language_pref: str
    text_size_pref: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
