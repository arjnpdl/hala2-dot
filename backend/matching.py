"""Hybrid matching engine - keyword + semantic matching."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from models import User, TalentProfile, StartupProfile, InvestorProfile, Embedding, UserRole
from typing import List, Dict, Optional
from config import settings
from datetime import datetime
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import asyncio

embedder = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=settings.GOOGLE_API_KEY
) if settings.GOOGLE_API_KEY else None


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude_v1 = sum(a * a for a in v1) ** 0.5
    magnitude_v2 = sum(a * a for a in v2) ** 0.5
    
    if magnitude_v1 == 0 or magnitude_v2 == 0:
        return 0.0
        
    return dot_product / (magnitude_v1 * magnitude_v2)


async def generate_embedding(text: str) -> List[float]:
    """Generate embedding using Google Gemini gemini-embedding-001."""
    # gemini-embedding-001 output dimension is 768
    EMBEDDING_DIM = 768

    if not text or not embedder:
        return [0.0] * EMBEDDING_DIM

    try:
        # LangChain's embedder is sync — run in thread to keep async safe
        # use embed_query for single string to avoid batching overhead if possible, 
        # though embed_documents works too.
        vector = await asyncio.get_event_loop().run_in_executor(
            None,
            embedder.embed_query,
            text
        )
        return vector
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0.0] * EMBEDDING_DIM


async def store_embedding(db: AsyncSession, user_id: str, embedding: List[float], text_source: str):
    """Store or update embedding for a user."""
    from models import Embedding
    from uuid import UUID
    
    # Check if embedding exists
    result = await db.execute(
        select(Embedding).where(
            Embedding.user_id == user_id,
            Embedding.text_source == text_source
        )
    )
    existing = result.scalars().first()
    
    if existing:
        existing.embedding = embedding
        existing.created_at = datetime.utcnow().isoformat()
    else:
        new_embedding = Embedding(
            user_id=user_id,
            embedding=embedding,
            text_source=text_source,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(new_embedding)
    
    await db.commit()


def calculate_jaccard_similarity(set1: List[str], set2: List[str]) -> float:
    """Calculate Jaccard similarity between two sets."""
    if not set1 or not set2:
        return 0.0
    
    set1_set = set(set1)
    set2_set = set(set2)
    
    intersection = len(set1_set & set2_set)
    union = len(set1_set | set2_set)
    
    if union == 0:
        return 0.0
    
    return intersection / union


async def match_talent_to_startup(
    db: AsyncSession,
    talent_id: str,
    startup_id: str,
    job_id: Optional[str] = None
) -> Dict:
    """Match talent to a startup role using hybrid scoring."""
    from uuid import UUID
    from models import JobPosting
    
    # Get talent profile
    talent_result = await db.execute(
        select(TalentProfile).where(TalentProfile.user_id == talent_id)
    )
    talent = talent_result.scalars().first()
    
    # Get startup profile
    startup_result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == startup_id)
    )
    startup = startup_result.scalars().first()
    
    if not talent or not startup:
        return {"error": "Profile not found"}
    
    # Score A: Keyword Match (60%)
    talent_skills = []
    for s in (talent.skills or []):
        if isinstance(s, dict):
            talent_skills.append(s.get("name", "").lower())
        elif isinstance(s, str):
            talent_skills.append(s.lower())
    
    # Use job-specific skills if job_id is provided, else use startup general skills
    required_skills = [s.lower() for s in (startup.required_skills or [])]
    
    # Also include tech stack in the keyword pool for general startup matching
    startup_keywords = list(required_skills)
    if startup.tech_stack:
        startup_keywords.extend([s.lower() for s in startup.tech_stack])
    
    if job_id:
        job_result = await db.execute(
            select(JobPosting).where(JobPosting.id == job_id)
        )
        job = job_result.scalars().first()
        if job:
            startup_keywords = [s.lower() for s in (job.required_skills or [])]

    keyword_score = calculate_jaccard_similarity(talent_skills, startup_keywords)
    print(f"DEBUG: Matching {talent.name} to {startup.name}")
    print(f"DEBUG: Talent Skills: {talent_skills}")
    print(f"DEBUG: Startup Keywords: {startup_keywords}")
    print(f"DEBUG: Keyword Score: {keyword_score}")
    
    # Score B: Semantic Match (40%)
    # Get embeddings
    talent_embedding_result = await db.execute(
        select(Embedding).where(
            Embedding.user_id == talent_id,
            Embedding.text_source == "profile"
        )
    )
    talent_embedding = talent_embedding_result.scalars().first()
    
    startup_embedding_result = await db.execute(
        select(Embedding).where(
            Embedding.user_id == startup_id,
            Embedding.text_source == "profile"
        )
    )
    startup_embedding = startup_embedding_result.scalars().first()
    
    final_score = 0.0
    semantic_score = 0.0
    # Final Score calculation
    # If we have both embeddings, use hybrid scoring
    if talent_embedding and startup_embedding:
        v1 = talent_embedding.embedding
        v2 = startup_embedding.embedding
        if isinstance(v1, list) and isinstance(v2, list):
            semantic_score = cosine_similarity(v1, v2)
        final_score = (keyword_score * 0.6) + (semantic_score * 0.4)
    else:
        final_score = keyword_score
    
    # Determine matched and missing skills
    talent_skill_set = set(talent_skills)
    required_skill_set = set(required_skills)
    matched_skills = list(talent_skill_set & required_skill_set)
    missing_skills = list(required_skill_set - talent_skill_set)
    
    return {
        "user_id": str(startup.user_id),
        "match_percentage": round(final_score * 100, 2),
        "score_breakdown": {
            "skills": round(keyword_score, 2),
            "semantic": round(semantic_score, 2)
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }


async def match_startup_to_investor(
    db: AsyncSession,
    startup_id: str,
    investor_id: str
) -> Dict:
    """Match startup to investor using hybrid scoring."""
    from uuid import UUID
    
    # Get profiles
    startup_result = await db.execute(
        select(StartupProfile).where(StartupProfile.user_id == startup_id)
    )
    startup = startup_result.scalars().first()
    
    investor_result = await db.execute(
        select(InvestorProfile).where(InvestorProfile.user_id == investor_id)
    )
    investor = investor_result.scalars().first()
    
    if not startup or not investor:
        return {"error": "Profile not found"}
    
    # Score A: Keyword Match (60%)
    # Match industry to preferred sectors, stage to investment stage
    startup_industry = [startup.industry.lower()] if startup.industry else []
    preferred_sectors = [s.lower() for s in (investor.preferred_sectors or [])]
    
    industry_match = calculate_jaccard_similarity(startup_industry, preferred_sectors)
    
    startup_stage = [startup.stage.value.lower()] if startup.stage else []
    investor_stages = [s.lower() for s in (investor.investment_stage or [])]
    
    stage_match = calculate_jaccard_similarity(startup_stage, investor_stages)
    
    keyword_score = (industry_match + stage_match) / 2
    
    # Score B: Semantic Match (40%)
    startup_embedding_result = await db.execute(
        select(Embedding).where(
            Embedding.user_id == startup_id,
            Embedding.text_source == "profile"
        )
    )
    startup_embedding = startup_embedding_result.scalars().first()
    
    investor_embedding_result = await db.execute(
        select(Embedding).where(
            Embedding.user_id == investor_id,
            Embedding.text_source == "thesis"
        )
    )
    investor_embedding = investor_embedding_result.scalars().first()
    
    semantic_score = 0.0
    if startup_embedding and investor_embedding:
        v1 = startup_embedding.embedding
        v2 = investor_embedding.embedding
        if isinstance(v1, list) and isinstance(v2, list):
            semantic_score = cosine_similarity(v1, v2)
        final_score = (keyword_score * 0.5) + (semantic_score * 0.5)
    else:
        final_score = keyword_score
    
    return {
        "user_id": str(investor.user_id),
        "match_percentage": round(final_score * 100, 2),
        "score_breakdown": {
            "industry_stage": round(keyword_score, 2),
            "semantic": round(semantic_score, 2)
        }
    }
