import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.case import Case, CaseFact
from backend.app.models.chat import ChatSession, ChatMessage, Answer
from backend.app.models.history import History
from backend.app.schemas.chat import ChatStartRequest, ChatMessageRequest, ChatSessionOut, ChatMessageOut
from backend.app.routers.auth import get_current_user
from backend.app.services.ai_service import ai_service
from backend.app.services.fact_extractor import FactExtractor

router = APIRouter(prefix="/api/chat", tags=["Chat Intake"])

@router.post("/start", response_model=ChatSessionOut)
def start_chat_session(
    data: ChatStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == data.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    # Check if existing session exists
    session = db.query(ChatSession).filter(ChatSession.case_id == case.id, ChatSession.is_active == True).first()
    if not session:
        session = ChatSession(
            case_id=case.id,
            current_step=1,
            total_steps=6,
            is_active=True
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Gather known facts
    existing_facts = db.query(CaseFact).filter(CaseFact.case_id == case.id).all()
    facts_map = {f.fact_key: f.fact_value for f in existing_facts}

    # If messages already exist in this session, return current session
    existing_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    if existing_msgs:
        return _format_session_out(session, existing_msgs, facts_map, case.emergency_flag)

    # Create initial personalized greeting and first question
    category = case.category
    item_or_subject = facts_map.get("object_item") or facts_map.get("fraud_channel") or facts_map.get("consumer_product") or "property/rights"

    # Emergency check
    if case.emergency_flag:
        emergency_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content="⚠️ **EMERGENCY NOTICE: Your immediate safety comes first.** If you or anyone else is facing immediate danger, ongoing violence, or threat to life, please immediately contact **National Emergency: 112** or **Police: 100** before proceeding.",
            step_number=1,
            input_type="notice"
        )
        db.add(emergency_msg)

    # Introductory polite message
    intro_text = (
        f"I understand that your {item_or_subject} was involved in this incident. "
        f"I will ask a few short questions, one at a time, to organize the details for your case. "
        f"You can skip any optional questions at any time."
    )
    intro_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=intro_text,
        step_number=1,
        input_type="notice"
    )
    db.add(intro_msg)

    # Find the next question that hasn't been extracted yet!
    next_q = ai_service.get_next_question(category, facts_map, answered_codes=[])
    if next_q:
        first_q_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=next_q.text,
            step_number=1,
            question_id=next_q.code,
            options_json=json.dumps(next_q.options),
            input_type=next_q.q_type
        )
        db.add(first_q_msg)
    else:
        # All essential facts already present!
        finish_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content="Thank you! We have collected all primary facts from your description. You can proceed to upload supporting evidence or review your case summary.",
            step_number=session.total_steps,
            input_type="notice"
        )
        db.add(finish_msg)

    db.commit()

    all_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    return _format_session_out(session, all_msgs, facts_map, case.emergency_flag)

@router.post("/message", response_model=ChatSessionOut)
def send_chat_message(
    data: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == data.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    session = db.query(ChatSession).filter(ChatSession.case_id == case.id, ChatSession.is_active == True).first()
    if not session:
        raise HTTPException(status_code=400, detail="No active chat session found. Please start session first.")

    # Emergency check in user input
    user_emergency = FactExtractor.check_emergency(data.content)
    if user_emergency:
        case.emergency_flag = True

    # 1. Record User Message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content="[Skipped question]" if data.is_skip else data.content,
        step_number=session.current_step,
        question_id=data.question_code,
        input_type="answer"
    )
    db.add(user_msg)

    # 2. Record Answer & Fact if not skipped
    if not data.is_skip and data.question_code:
        # Save Answer row
        db.add(Answer(
            session_id=session.id,
            question_code=data.question_code,
            answer_value=data.content
        ))

        # Check target fact key from questions catalog
        questions = ai_service.get_questions_for_category(case.category) if hasattr(ai_service, 'get_questions_for_category') else []
        target_fact_key = data.question_code.replace("theft_", "").replace("cyber_", "").replace("assault_", "").replace("prop_", "").replace("consumer_", "")

        # Look up exact question item
        from backend.app.services.interview_engine import InterviewEngine
        cat_questions = InterviewEngine.get_questions_for_category(case.category)
        matched_q = next((q for q in cat_questions if q.code == data.question_code), None)
        if matched_q:
            target_fact_key = matched_q.target_fact

        # Update or add CaseFact
        fact_entry = db.query(CaseFact).filter(CaseFact.case_id == case.id, CaseFact.fact_key == target_fact_key).first()
        if fact_entry:
            fact_entry.fact_value = data.content
            fact_entry.source = "question"
        else:
            db.add(CaseFact(
                case_id=case.id,
                fact_key=target_fact_key,
                fact_value=data.content,
                confidence=1.0,
                is_extracted=False,
                source="question"
            ))

        # Update Case model fields directly for core fields
        if target_fact_key in ["date_time", "incident_date"]:
            case.incident_date = data.content
        elif target_fact_key in ["location", "incident_location"]:
            case.incident_location = data.content
        elif target_fact_key in ["suspect_identified", "persons_involved"]:
            case.suspect_info = data.content
        elif target_fact_key in ["amount", "amount_lost", "object_item"]:
            case.loss_damage = data.content

    # Advance current step
    session.current_step += 1

    # 3. Fetch answered codes
    answered = db.query(Answer.question_code).filter(Answer.session_id == session.id).all()
    answered_codes = [a[0] for a in answered]
    if data.question_code and data.question_code not in answered_codes:
        answered_codes.append(data.question_code)

    # 4. Gather updated facts map
    db.commit() # commit current changes so queries see them
    current_facts = db.query(CaseFact).filter(CaseFact.case_id == case.id).all()
    facts_map = {f.fact_key: f.fact_value for f in current_facts}

    # 5. Calculate updated readiness score
    score, used, needed, _ = ai_service.calculate_case_readiness(case.category, facts_map, evidence_count=0)
    case.completeness_score = score
    db.commit()

    # 6. Determine Next Question
    next_q = ai_service.get_next_question(case.category, facts_map, answered_codes)

    if next_q and session.current_step <= session.total_steps:
        bot_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=next_q.text,
            step_number=session.current_step,
            question_id=next_q.code,
            options_json=json.dumps(next_q.options),
            input_type=next_q.q_type
        )
        db.add(bot_msg)
    else:
        # Completed intake
        case.status = "ready_for_review"
        bot_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content="✅ **Case details gathered successfully!** Your facts have been organized into a structured case profile. You can now attach supporting evidence or proceed directly to Case Review and Legal Analysis.",
            step_number=session.total_steps,
            input_type="completed"
        )
        db.add(bot_msg)

    # Log history
    db.add(History(
        user_id=current_user.id,
        case_id=case.id,
        action_type="chat_answered",
        description=f"Answered intake question: {data.question_code or 'step'}"
    ))
    db.commit()

    all_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    return _format_session_out(session, all_msgs, facts_map, case.emergency_flag)

@router.get("/{case_id}", response_model=ChatSessionOut)
def get_chat_session(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    session = db.query(ChatSession).filter(ChatSession.case_id == case.id, ChatSession.is_active == True).first()
    if not session:
        raise HTTPException(status_code=404, detail="No active chat session found.")

    facts = db.query(CaseFact).filter(CaseFact.case_id == case.id).all()
    facts_map = {f.fact_key: f.fact_value for f in facts}
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()

    return _format_session_out(session, msgs, facts_map, case.emergency_flag)

def _format_session_out(session: ChatSession, msgs: List[ChatMessage], facts_map: dict, emergency: bool) -> ChatSessionOut:
    formatted_msgs = []
    for m in msgs:
        opts = []
        if m.options_json:
            try:
                opts = json.loads(m.options_json)
            except Exception:
                opts = []
        formatted_msgs.append(ChatMessageOut(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            step_number=m.step_number,
            question_id=m.question_id,
            options=opts,
            input_type=m.input_type,
            created_at=m.created_at
        ))

    return ChatSessionOut(
        id=session.id,
        case_id=session.case_id,
        current_step=session.current_step,
        total_steps=session.total_steps,
        is_active=session.is_active,
        emergency_detected=emergency,
        messages=formatted_msgs,
        extracted_facts=facts_map
    )
