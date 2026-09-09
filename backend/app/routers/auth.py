import os
import datetime
import hashlib
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.history import History
from backend.app.schemas.auth import UserCreate, UserLogin, UserUpdate, UserOut, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

SECRET_KEY = os.getenv("SECRET_KEY", "lawbot_citizen_secret_key_india_2024")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    salt = "lawbot_salt_"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    # If no token provided or invalid, return the default demo user for seamless hackathon testing
    if not credentials:
        demo_user = db.query(User).filter(User.email == "citizen@lawbot.gov.in").first()
        if not demo_user:
            demo_user = User(
                email="citizen@lawbot.gov.in",
                hashed_password=hash_password("Citizen@123"),
                full_name="Rajesh Kumar",
                phone_number="+91 98765 43210",
                city="Hyderabad",
                state="Telangana",
                language_pref="en",
                text_size_pref="normal"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        # Fallback to demo user rather than crashing
        demo_user = db.query(User).filter(User.email == "citizen@lawbot.gov.in").first()
        if demo_user:
            return demo_user
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone_number=data.phone_number,
        city=data.city,
        state=data.state,
        language_pref=data.language_pref or "en",
        text_size_pref=data.text_size_pref or "normal"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Add history
    db.add(History(
        user_id=new_user.id,
        action_type="account_created",
        description="LawBot AI citizen profile created."
    ))
    db.commit()

    token = create_access_token(new_user.id, new_user.email)
    return Token(access_token=token, user=UserOut.from_orm(new_user))

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    token = create_access_token(user.id, user.email)
    return Token(access_token=token, user=UserOut.from_orm(user))

@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """One-click instant login for hackathon evaluators and demo mode."""
    user = db.query(User).filter(User.email == "citizen@lawbot.gov.in").first()
    if not user:
        user = User(
            email="citizen@lawbot.gov.in",
            hashed_password=hash_password("Citizen@123"),
            full_name="Rajesh Kumar",
            phone_number="+91 98765 43210",
            city="Hyderabad",
            state="Telangana",
            language_pref="en",
            text_size_pref="normal"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id, user.email)
    return Token(access_token=token, user=UserOut.from_orm(user))

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone_number is not None:
        current_user.phone_number = data.phone_number
    if data.city is not None:
        current_user.city = data.city
    if data.state is not None:
        current_user.state = data.state
    if data.language_pref is not None:
        current_user.language_pref = data.language_pref
    if data.text_size_pref is not None:
        current_user.text_size_pref = data.text_size_pref

    db.commit()
    db.refresh(current_user)
    return current_user
