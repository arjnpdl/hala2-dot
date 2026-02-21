import { useQuery } from '@tanstack/react-query'
import { getTalentMatches, getInvestorMatches, getStartupMatches } from '../api/matches'
import { useAuth } from './useAuth'

export function useMatchScore(entityId, matchType) {
  const { role } = useAuth()
  
  const { data, isLoading } = useQuery({
    queryKey: ['matchScore', entityId, matchType],
    queryFn: async () => {
      if (role === 'FOUNDER' && matchType === 'talent') {
        const matches = await getTalentMatches()
        return matches.find((m) => m.talent_id === entityId)
      } else if (role === 'FOUNDER' && matchType === 'investor') {
        const matches = await getInvestorMatches()
        return matches.find((m) => m.investor_id === entityId)
      } else if (role === 'TALENT') {
        const matches = await getStartupMatches()
        return matches.find((m) => m.startup_id === entityId)
      }
      return null
    },
    enabled: !!entityId && !!matchType,
  })

  return {
    score: data?.match_percentage || 0,
    matchedSkills: data?.matched_skills || [],
    missingSkills: data?.missing_skills || [],
    scoreBreakdown: data?.score_breakdown || {},
    loading: isLoading,
  }
}
