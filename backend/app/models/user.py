import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    language_pref = Column(String(10), default="en") # en, te, hi
    text_size_pref = Column(String(10), default="normal") # normal, medium, large
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    cases = relationship("Case", back_populates="user", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="user", cascade="all, delete-orphan")
    histories = relationship("History", back_populates="user", cascade="all, delete-orphan")
