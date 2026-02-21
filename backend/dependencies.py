"""Dependencies for FastAPI routes."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import decode_token, get_user_by_id
from models import User, UserRole
from config import settings
from mock_data import MOCK_USERS

security = HTTPBearer()


class MockUser:
    """Mock user object for development."""
    def __init__(self, user_data):
        self.id = user_data["id"]
        self.email = user_data["email"]
        self.role = UserRole(user_data["role"])
        self.profile_data = user_data.get("profile_data", {})


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user."""
    token = credentials.credentials
    # print(f"DEBUG: Received token: {token[:10]}...{token[-10:]}")
    payload = decode_token(token)
    
    if not payload:
        print(f"Auth Failed: Token decode returned None")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    if settings.USE_MOCK_DATA:
        # Find mock user by ID
        for email, user_data in MOCK_USERS.items():
            if user_data["id"] == user_id:
                return MockUser(user_data)
        # If not found, create a mock user based on role from token
        role_str = payload.get("role", "FOUNDER")
        return MockUser({
            "id": user_id,
            "email": f"{role_str.lower()}@neplaunch.com",
            "role": role_str,
            "profile_data": {}
        })
    
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
