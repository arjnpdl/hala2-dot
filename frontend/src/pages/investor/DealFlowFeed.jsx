import { useQuery } from '@tanstack/react-query'
import { getInvestorMatches } from '../../api/matches'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import ConnectionButton from '../../components/shared/ConnectionButton'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { TrendingUp } from 'lucide-react'

export default function DealFlowFeed() {
  const { data: startups = [], isLoading } = useQuery({
    queryKey: ['investorMatches'],
    queryFn: getInvestorMatches,
  })

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div>
      <PageHeader title="Deal Flow" subtitle="Thesis-aligned startups" />

      <div className="p-6">
        {startups.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No deal flow yet"
            message="Complete your investment thesis to see matched startups"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {startups.map((startup) => (
              <div key={startup.investor_id || startup.startup_id} className="glass-card p-6 group hover:border-[#1B4FD8]/30 transition-all bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0C2D6B] uppercase tracking-tight">{startup.name}</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase tracking-widest mt-1">{startup.fund || startup.industry || startup.type}</p>
                  </div>
                  <MatchScoreRing score={startup.match_percentage} size={50} />
                </div>

                <div className="mb-6 p-3 bg-[#F8F7F4] rounded-lg border border-[var(--border)]">
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Signal Decomposition</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold">
                    Industry/Stage: <span className="text-[#1B4FD8]">{(startup.score_breakdown?.industry_stage || 0).toFixed(2)}</span> |
                    Semantic: <span className="text-[#1B4FD8]">{(startup.score_breakdown?.semantic || 0).toFixed(2)}</span>
                  </p>
                </div>

                <div className="pt-2">
                  <ConnectionButton targetId={startup.startup_id || startup.investor_id} targetRole="FOUNDER" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
