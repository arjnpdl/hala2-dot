"""AI-powered features routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from database import get_db
from models import User, UserRole
from dependencies import get_current_user
from config import settings
from mock_data import MOCK_PITCH_FEEDBACK, MOCK_TEAM_GAP_ANALYSIS
from langchain_google_genai import ChatGoogleGenerativeAI
import json

chat_model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=settings.GOOGLE_API_KEY
) if settings.GOOGLE_API_KEY else None

router = APIRouter()

class PitchFeedbackRequest(BaseModel):
    pitch_text: str

@router.post("/pitch-feedback")
async def get_pitch_feedback(
    request: PitchFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI feedback on pitch."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if settings.USE_MOCK_DATA:
        # Return mock feedback
        import asyncio
        await asyncio.sleep(1)  # Simulate API delay
        return MOCK_PITCH_FEEDBACK
    
    if not chat_model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    prompt = f"""Act as a Kathmandu-based Angel Investor. Critique this pitch based on Market Size in Nepal and Team-Market fit.

Pitch:
{request.pitch_text}

Provide structured feedback in JSON format with the following sections:
1. market_size_score (1-10)
2. market_size_feedback (text)
3. team_market_fit_score (1-10)
4. team_market_fit_feedback (text)
5. traction_narrative_score (1-10)
6. traction_narrative_feedback (text)
7. defensibility_score (1-10)
8. defensibility_feedback (text)
9. overall_assessment (text)
10. suggestions (array of strings)
"""
    
    try:
        # Use LangChain's invoke for Gemini
        response = await chat_model.ainvoke([
            ("system", "You are a Kathmandu-based Angel Investor providing structured pitch feedback."),
            ("user", prompt)
        ])
        
        feedback_text = response.content
        
        # Try to parse as JSON, fallback to text
        try:
            # Clean up potential markdown formatting in response
            if "```json" in feedback_text:
                feedback_text = feedback_text.split("```json")[1].split("```")[0].strip()
            elif "```" in feedback_text:
                feedback_text = feedback_text.split("```")[1].split("```")[0].strip()
            
            feedback = json.loads(feedback_text)
        except:
            feedback = {"raw_feedback": feedback_text}
        
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/team-gap-analysis")
async def get_team_gap_analysis(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI analysis of team gaps."""
    if current_user.role != UserRole.FOUNDER:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if settings.USE_MOCK_DATA:
        import asyncio
        await asyncio.sleep(0.5)  # Simulate API delay
        return MOCK_TEAM_GAP_ANALYSIS
    
    # This would analyze the startup profile and identify missing critical roles
    # For now, return a structured response
    return {
        "gaps": [
            {
                "role": "CFO/Finance Lead",
                "impact": "High",
                "reason": "Investors require financial planning and reporting",
                "recommended_action": "Post a role for Finance Lead"
            },
            {
                "role": "Technical Lead",
                "impact": "Critical",
                "reason": "Startup requires strong technical foundation",
                "recommended_action": "Post a role for Senior Developer"
            }
        ],
        "investor_readiness_score": 65,
        "recommendations": [
            "Add a CFO to improve investor confidence",
            "Strengthen technical team to demonstrate product capability"
        ]
    }
