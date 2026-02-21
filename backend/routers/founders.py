from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional, List, Dict
from database import get_db
from models import User, StartupProfile, UserRole, JobPosting
from dependencies import get_current_user
from matching import generate_embedding, store_embedding
from datetime import datetime
from uuid import UUID
from config import settings
from mock_data import MOCK_STARTUP_PROFILE, MOCK_USERS

router = APIRouter()


class StartupProfileUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    website: Optional[str] = None
    founding_year: Optional[int] = None
    mrr: Optional[float] = None
    user_count: Optional[int] = None
    growth_rate: Optional[float] = None
    funding_goal: Optional[float] = None
    equity_offered: Optional[float] = None
    use_of_funds: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    required_skills: Optional[List[str]] = None
    problem_statement: Optional[str] = None
    team_members: Optional[List[Dict]] = None


class JobPostingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    required_skills: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    compensation: Optional[str] = None


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    required_skills: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    compensation: Optional[str] = None


@router.get("/profile")
async def get_startup_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get startup profile."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if settings.USE_MOCK_DATA:
        return MOCK_STARTUP_PROFILE
    
    result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        return {"message": "Profile not created yet"}
    
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "name": profile.name,
        "tagline": profile.tagline,
        "industry": profile.industry,
        "stage": profile.stage.value if profile.stage else None,
        "website": profile.website,
        "founding_year": profile.founding_year,
        "mrr": profile.mrr,
        "user_count": profile.user_count,
        "growth_rate": profile.growth_rate,
        "funding_goal": profile.funding_goal,
        "equity_offered": profile.equity_offered,
        "use_of_funds": profile.use_of_funds,
        "tech_stack": profile.tech_stack,
        "required_skills": profile.required_skills,
        "problem_statement": profile.problem_statement,
        "team_members": profile.team_members,
        "open_roles_count": profile.open_roles_count,
        "completeness_score": profile.completeness_score
    }


@router.patch("/profile")
async def update_startup_profile(
    profile_data: StartupProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update startup profile."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = StartupProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    profile.updated_at = datetime.utcnow().isoformat()
    
    # Calculate completeness score
    fields = ["name", "tagline", "industry", "stage", "problem_statement", 
              "funding_goal", "required_skills", "tech_stack"]
    filled = sum(1 for field in fields if getattr(profile, field))
    profile.completeness_score = (filled / len(fields)) * 100
    
    await db.commit()
    await db.refresh(profile)
    
    # Generate and store embedding
    profile_text = f"{profile.name or ''} {profile.tagline or ''} {profile.problem_statement or ''} {' '.join(profile.tech_stack or [])}"
    embedding = await generate_embedding(profile_text)
    await store_embedding(db, str(current_user.id), embedding, "profile")
    
    return {"message": "Profile updated", "completeness_score": profile.completeness_score}


@router.post("/jobs")
async def create_job(
    job_data: JobPostingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job posting."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    
    job = JobPosting(
        startup_id=profile.id,
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        required_skills=job_data.required_skills or [],
        location=job_data.location,
        job_type=job_data.job_type,
        compensation=job_data.compensation,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return {
        "id": str(job.id),
        "startup_id": str(job.startup_id),
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "required_skills": job.required_skills,
        "location": job.location,
        "job_type": job.job_type,
        "compensation": job.compensation,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


@router.get("/jobs")
async def get_my_jobs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all jobs posted by the current startup."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return []
    
    result = await db.execute(
        select(JobPosting).where(JobPosting.startup_id == profile.id)
    )
    jobs = result.scalars().all()
    return [{
        "id": str(j.id),
        "startup_id": str(j.startup_id),
        "title": j.title,
        "description": j.description,
        "requirements": j.requirements,
        "required_skills": j.required_skills or [],
        "location": j.location,
        "job_type": j.job_type,
        "compensation": j.compensation,
        "created_at": j.created_at,
        "updated_at": j.updated_at,
    } for j in jobs]


@router.put("/jobs/{job_id}")
async def update_job(
    job_id: str,
    job_data: JobPostingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a job posting."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    
    result = await db.execute(
        select(JobPosting).where(JobPosting.id == job_id, JobPosting.startup_id == profile.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    update_data = job_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)
    job.updated_at = datetime.utcnow().isoformat()
    
    await db.commit()
    await db.refresh(job)
    return {
        "id": str(job.id),
        "startup_id": str(job.startup_id),
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "required_skills": job.required_skills or [],
        "location": job.location,
        "job_type": job.job_type,
        "compensation": job.compensation,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a job posting."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify ownership
    result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    result = await db.execute(
        select(JobPosting).where(JobPosting.id == job_id, JobPosting.startup_id == profile.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted"}
