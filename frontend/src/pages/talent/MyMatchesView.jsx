import { useQuery } from '@tanstack/react-query'
import { getStartupMatches } from '../../api/matches'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import MatchBadge from '../../components/shared/MatchBadge'
import ConnectionButton from '../../components/shared/ConnectionButton'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { Target } from 'lucide-react'

export default function MyMatchesView() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['startupMatches'],
    queryFn: getStartupMatches,
  })

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div>
      <PageHeader title="My Matches" subtitle="Startups matched to your profile" />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {matches.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Searching for your destiny..."
            message="Your profile is unique. We're running alignment algorithms to find startups that truly match your potential."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {matches.map((match) => (
              <div key={match.startup_id} className="glass-card group hover:border-[#1B4FD8]/30 transition-all p-8 flex flex-col h-full bg-white">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-[#0C2D6B] group-hover:text-[#1B4FD8] transition-colors uppercase tracking-tight">
                      {match.name}
                    </h3>
                    <p className="text-[var(--text-secondary)] font-semibold mt-2 text-sm leading-relaxed">
                      {match.tagline}
                    </p>
                  </div>
                  <MatchScoreRing score={match.match_percentage} size={60} />
                </div>

                <div className="space-y-6 mb-8 flex-1">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-[#1B4FD8] uppercase tracking-widest mb-3">Alignment Breakdown</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.matched_skills?.map((skill) => (
                        <div key={skill} className="px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#16A34A]/10 text-[#16A34A] text-[10px] font-extrabold uppercase">
                          {skill}
                        </div>
                      ))}
                      {match.missing_skills?.map((skill) => (
                        <div key={skill} className="px-3 py-1 rounded-full bg-[#F8F7F4] border border-[var(--border)] text-[var(--text-muted)] text-[10px] font-extrabold uppercase line-through opacity-70">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase">Skill Match</p>
                      <p className="text-[var(--text-primary)] font-extrabold text-sm mt-1">{(match.score_breakdown?.skills * 10).toFixed(1)}/10</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase">Vision Alignment</p>
                      <p className="text-[var(--text-primary)] font-extrabold text-sm mt-1">{(match.score_breakdown?.semantic * 10).toFixed(1)}/10</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <ConnectionButton targetId={match.startup_id} targetRole="FOUNDER" className="w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
