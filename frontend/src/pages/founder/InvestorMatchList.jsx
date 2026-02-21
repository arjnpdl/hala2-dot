import { useQuery } from '@tanstack/react-query'
import { getInvestorMatches } from '../../api/matches'
import PageHeader from '../../components/shared/PageHeader'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import EmptyState from '../../components/shared/EmptyState'
import { TrendingUp, Search, Filter, Mail, Link as LinkIcon, DollarSign } from 'lucide-react'
import { useState } from 'react'

export default function InvestorMatchList() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['investorMatches'],
    queryFn: getInvestorMatches,
  })

  const filteredMatches = (matches || [])
    .filter(match => match.match_percentage > 50)
    .filter(match =>
      match.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div>
      <PageHeader title="Venture Pipeline" subtitle="Discover capital partners aligned with your industry and stage." />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Filter by fund name, stage, or sector focus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 py-3 w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="premium-button btn-secondary flex items-center gap-2 px-6">
              <Filter size={18} /> Mandate Check
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />)}
          </div>
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Capital Pipeline Empty"
            message="No investors match your current profile or filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMatches.map((match) => (
              <div key={match.investor_id} className="glass-card group hover:border-[var(--accent)]/30 transition-all p-8 flex flex-col h-full bg-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-[var(--elevated)] rounded-2xl flex items-center justify-center font-black text-[var(--accent)] text-2xl border border-[var(--border)] shadow-inner uppercase">
                    {match.name?.[0]}
                  </div>
                  <MatchScoreRing score={match.match_percentage} size={50} />
                </div>

                <h3 className="text-xl font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight mb-1">
                  {match.name}
                </h3>
                <p className="text-xs font-black text-[var(--accent)] mt-1 uppercase tracking-widest">
                  {match.fund || match.type}
                </p>

                <div className="flex-1 mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Thesis Alignment</h4>
                      <p className="text-xs text-[var(--text-primary)] font-bold">{(match.score_breakdown?.semantic * 100).toFixed(0)}% Semantic Match</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Check Size</h4>
                      <div className="flex items-center gap-1 text-[var(--success)]">
                        <DollarSign size={12} />
                        <span className="text-xs font-black">Matched Mandate</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="p-2 rounded-lg bg-[var(--elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all">
                      <Mail size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-[var(--elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all">
                      <LinkIcon size={16} />
                    </button>
                  </div>
                  <button className="premium-button btn-secondary px-8 py-2 text-xs">
                    Review Thesis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
