import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    current_step = Column(Integer, default=1)
    total_steps = Column(Integer, default=8)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(50), nullable=False) # assistant, user, system
    content = Column(Text, nullable=False)
    step_number = Column(Integer, default=1)
    question_id = Column(String(100), nullable=True)
    options_json = Column(Text, nullable=True) # JSON list of buttons
    input_type = Column(String(50), default="text") # single_choice, text, yes_no, date, number, location
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_code = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False) # Cyber Fraud, Theft, etc.
    step_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False) # yes_no, single_choice, text, date, number, location
    options_json = Column(Text, nullable=True) # JSON array of selectable choices
    required = Column(Boolean, default=True)
    target_fact_key = Column(String(100), nullable=False)
    skip_condition_fact_key = Column(String(100), nullable=True)
    explanation_help = Column(Text, nullable=True)

    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    question_code = Column(String(100), nullable=False)
    answer_value = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="answers")
    question = relationship("Question", back_populates="answers")
