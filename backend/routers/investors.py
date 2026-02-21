"""Investor routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, InvestorProfile, UserRole
from dependencies import get_current_user
from matching import generate_embedding, store_embedding
from datetime import datetime
from config import settings
from mock_data import MOCK_INVESTOR_PROFILE

router = APIRouter()


class InvestorThesisUpdate(BaseModel):
    name: Optional[str] = None
    fund: Optional[str] = None
    type: Optional[str] = None
    investment_stage: Optional[List[str]] = None
    thesis_text: Optional[str] = None
    preferred_sectors: Optional[List[str]] = None
    check_size_min: Optional[float] = None
    check_size_max: Optional[float] = None
    geography_focus: Optional[str] = None
    key_signals: Optional[List[str]] = None


@router.get("/thesis")
async def get_investor_thesis(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get investor thesis/profile."""
    if current_user.role != UserRole.INVESTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if settings.USE_MOCK_DATA:
        return {
            "id": MOCK_INVESTOR_PROFILE["id"],
            "user_id": MOCK_INVESTOR_PROFILE["user_id"],
            "name": MOCK_INVESTOR_PROFILE["name"],
            "fund": MOCK_INVESTOR_PROFILE["fund"],
            "type": MOCK_INVESTOR_PROFILE["type"],
            "investment_stage": MOCK_INVESTOR_PROFILE["investment_stage"],
            "thesis_text": MOCK_INVESTOR_PROFILE["thesis_text"],
            "preferred_sectors": MOCK_INVESTOR_PROFILE["preferred_sectors"],
            "check_size_min": MOCK_INVESTOR_PROFILE["check_size_min"],
            "check_size_max": MOCK_INVESTOR_PROFILE["check_size_max"],
            "geography_focus": MOCK_INVESTOR_PROFILE["geography_focus"],
            "key_signals": MOCK_INVESTOR_PROFILE["key_signals"],
            "completeness_score": MOCK_INVESTOR_PROFILE["completeness_score"]
        }
    
    result = await db.execute(
        select(InvestorProfile).where(InvestorProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        return {"message": "Profile not created yet"}
    
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "name": profile.name,
        "fund": profile.fund,
        "type": profile.type,
        "investment_stage": profile.investment_stage,
        "thesis_text": profile.thesis_text,
        "preferred_sectors": profile.preferred_sectors,
        "check_size_min": profile.check_size_min,
        "check_size_max": profile.check_size_max,
        "geography_focus": profile.geography_focus,
        "key_signals": profile.key_signals,
        "completeness_score": profile.completeness_score
    }


@router.patch("/thesis")
async def update_investor_thesis(
    thesis_data: InvestorThesisUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update investor thesis."""
    if current_user.role != UserRole.INVESTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.execute(
        select(InvestorProfile).where(InvestorProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = InvestorProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    update_data = thesis_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    profile.updated_at = datetime.utcnow().isoformat()
    
    # Calculate completeness score
    fields = ["name", "thesis_text", "preferred_sectors", "investment_stage", 
              "check_size_min", "check_size_max"]
    filled = sum(1 for field in fields if getattr(profile, field))
    profile.completeness_score = (filled / len(fields)) * 100
    
    await db.commit()
    await db.refresh(profile)
    
    # Generate and store embedding
    thesis_text = f"{profile.thesis_text or ''} {' '.join(profile.preferred_sectors or [])} {' '.join(profile.key_signals or [])}"
    embedding = await generate_embedding(thesis_text)
    await store_embedding(db, str(current_user.id), embedding, "thesis")
    
    return {"message": "Thesis updated", "completeness_score": profile.completeness_score}
@router.get("/all")
async def get_all_investors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all investor profiles for the network view."""
    if current_user.role != UserRole.INVESTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if settings.USE_MOCK_DATA:
        # Return a list containing the mock investor
        return [MOCK_INVESTOR_PROFILE]
    
    result = await db.execute(
        select(InvestorProfile)
    )
    profiles = result.scalars().all()
    
    return [
        {
            "id": str(p.id),
            "user_id": str(p.user_id),
            "name": p.name,
            "fund": p.fund,
            "type": p.type,
            "investment_stage": p.investment_stage,
            "preferred_sectors": p.preferred_sectors,
            "geography_focus": p.geography_focus,
            "completeness_score": p.completeness_score
        }
        for p in profiles
    ]
