export const getPitchFeedback = async (pitchText) => {
  // Mock feedback
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
  return {
    market_size_score: 8,
    market_size_feedback: "The Nepal market shows strong potential with growing internet penetration.",
    team_market_fit_score: 7,
    team_market_fit_feedback: "Your team has strong technical skills.",
    traction_narrative_score: 6,
    traction_narrative_feedback: "Good early traction with 150 users.",
    defensibility_score: 7,
    defensibility_feedback: "Your tech stack and approach are solid.",
    overall_assessment: "Strong early-stage startup with good potential.",
    suggestions: [
      "Expand market size narrative to include South Asia",
      "Add sales/marketing expertise to the team",
    ]
  }
}

export const getTeamGapAnalysis = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    gaps: [
      {
        role: "CFO/Finance Lead",
        impact: "High",
        reason: "Investors require financial planning and reporting",
        recommended_action: "Post a role for Finance Lead"
      },
      {
        role: "Sales/Marketing Lead",
        impact: "Critical",
        reason: "Needed to accelerate user acquisition",
        recommended_action: "Post a role for Sales Lead"
      }
    ],
    investor_readiness_score: 65,
    recommendations: [
      "Add a CFO to improve investor confidence",
      "Strengthen sales/marketing team"
    ]
  }
}
