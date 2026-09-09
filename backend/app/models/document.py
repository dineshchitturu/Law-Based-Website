import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class CaseReport(Base):
    __tablename__ = "case_reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    summary_text = Column(Text, nullable=False)
    completeness_score = Column(Integer, default=50)
    used_facts_json = Column(Text, nullable=True) # JSON list of verified facts
    missing_facts_json = Column(Text, nullable=True) # JSON list of what is still needed
    recommended_steps_json = Column(Text, nullable=True) # JSON list of next steps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="reports")

class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    doc_type = Column(String(100), nullable=False) # police_complaint, cybercrime_report, consumer_notice, incident_statement, evidence_list, chronology
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    status = Column(String(50), default="draft") # draft, finalized
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="documents")
