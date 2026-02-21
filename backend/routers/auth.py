"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User, UserRole
from auth import get_password_hash, verify_password, create_access_token, get_user_by_email
from datetime import datetime, timedelta
from config import settings
from mock_data import MOCK_USERS

router = APIRouter()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    if settings.USE_MOCK_DATA:
        # Mock registration - just return token
        from uuid import uuid4
        user_id = str(uuid4())
        access_token = create_access_token(data={"sub": user_id, "role": user_data.role.value})
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            role=user_data.role.value
        )
    
    # Check if user exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        profile_data={},
        created_at=datetime.utcnow().isoformat()
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create appropriate profile record based on role
    from models import TalentProfile, StartupProfile, InvestorProfile
    if user_data.role == UserRole.TALENT:
        new_profile = TalentProfile(
            user_id=new_user.id,
            name="New Talent",
            updated_at=datetime.utcnow().isoformat()
        )
        db.add(new_profile)
    elif user_data.role == UserRole.FOUNDER:
        new_profile = StartupProfile(
            user_id=new_user.id,
            name="New Startup",
            updated_at=datetime.utcnow().isoformat()
        )
        db.add(new_profile)
    elif user_data.role == UserRole.INVESTOR:
        new_profile = InvestorProfile(
            user_id=new_user.id,
            name="New Investor",
            updated_at=datetime.utcnow().isoformat()
        )
        db.add(new_profile)
    
    await db.commit()
    
    # Create token
    access_token = create_access_token(data={"sub": str(new_user.id), "role": user_data.role.value})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(new_user.id),
        role=user_data.role.value
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user."""
    if settings.USE_MOCK_DATA:
        # Mock login - accept any password for demo users
        mock_user = MOCK_USERS.get(credentials.email)
        if not mock_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password. Try: founder@neplaunch.com, talent@neplaunch.com, or investor@neplaunch.com"
            )
        
        # Accept any password in mock mode, or verify against stored password
        if credentials.password != mock_user["password"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password. Use: password123"
            )
        
        access_token = create_access_token(data={"sub": mock_user["id"], "role": mock_user["role"]})
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=mock_user["id"],
            role=mock_user["role"]
        )
    
    user = await get_user_by_email(db, credentials.email)
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        role=user.role.value
    )
