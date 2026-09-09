import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Cyber Fraud, Theft, Assault / Injury, Property Dispute, Consumer Problem, Other
    status = Column(String(50), default="draft") # draft, in_progress, ready_for_review, closed
    initial_description = Column(Text, nullable=True)
    incident_date = Column(String(100), nullable=True)
    incident_time = Column(String(100), nullable=True)
    incident_location = Column(String(255), nullable=True)
    complainant_name = Column(String(255), nullable=True)
    suspect_info = Column(Text, nullable=True)
    loss_damage = Column(Text, nullable=True)
    completeness_score = Column(Integer, default=20) # 0 to 100
    emergency_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cases")
    facts = relationship("CaseFact", back_populates="case", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="case", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    legal_matches = relationship("LegalMatch", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("CaseReport", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("GeneratedDocument", back_populates="case", cascade="all, delete-orphan")
    histories = relationship("History", back_populates="case", cascade="all, delete-orphan")

class CaseFact(Base):
    __tablename__ = "case_facts"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    fact_key = Column(String(100), nullable=False, index=True)
    fact_value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    is_extracted = Column(Boolean, default=False)
    source = Column(String(50), default="question") # nlp, question, user_edit
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="facts")
