import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class LegalAct(Base):
    __tablename__ = "legal_acts"

    id = Column(String(50), primary_key=True, index=True) # act-bns-2023
    short_code = Column(String(20), nullable=False, index=True) # BNS, BNSS, BSA, IT_ACT, CPA
    title = Column(String(255), nullable=False)
    enacted_year = Column(Integer, nullable=True)
    jurisdiction = Column(String(100), default="India")
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    source_url = Column(String(500), nullable=True)

    sections = relationship("LegalSection", back_populates="act", cascade="all, delete-orphan")

class LegalSection(Base):
    __tablename__ = "legal_sections"

    id = Column(String(50), primary_key=True, index=True) # sec-bns-303
    act_id = Column(String(50), ForeignKey("legal_acts.id"), nullable=False)
    act_short_code = Column(String(20), nullable=False)
    section_number = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False) # exact statutory text excerpt
    simple_explanation = Column(Text, nullable=False) # layman explanation
    punishment = Column(Text, nullable=True)
    bailable = Column(String(100), nullable=True) # Non-bailable / Bailable
    cognizable = Column(String(200), nullable=True) # Cognizable / Non-cognizable
    compoundable = Column(String(200), nullable=True)
    keywords_json = Column(Text, nullable=True) # JSON array of keywords
    source_url = Column(String(500), nullable=True)
    last_verified = Column(String(50), default="2024-07-01")

    act = relationship("LegalAct", back_populates="sections")
    matches = relationship("LegalMatch", back_populates="section", cascade="all, delete-orphan")

class LegalMatch(Base):
    __tablename__ = "legal_matches"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    section_id = Column(String(50), ForeignKey("legal_sections.id"), nullable=False)
    relevance_score = Column(Float, default=0.85)
    reason_explanation = Column(Text, nullable=False)
    matched_facts_json = Column(Text, nullable=True) # JSON of facts that triggered this match
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="legal_matches")
    section = relationship("LegalSection", back_populates="matches")
