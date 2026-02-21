import { useQuery } from '@tanstack/react-query'
import { getTalentMatches } from '../../api/matches'
import PageHeader from '../../components/shared/PageHeader'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import EmptyState from '../../components/shared/EmptyState'
import { Users, Search, Filter, Mail, Link as LinkIcon, Briefcase } from 'lucide-react'
import { useState } from 'react'

export default function TalentMatchList() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['talentMatches'],
    queryFn: getTalentMatches,
  })

  const filteredMatches = (matches || [])
    .filter(match => match.match_percentage > 50)
    .filter(match =>
      match.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (match.matched_skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  return (
    <div>
      <PageHeader title="Talent Pipeline" subtitle="Discover verified high-caliber talent matching your venture's DNA." />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Filter by role, skill, or founder name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 py-3 w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="premium-button btn-secondary flex items-center gap-2 px-6">
              <Filter size={18} /> Signal Check
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />)}
          </div>
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Pipeline Empty"
            message="No active talent matches your current search criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match) => (
              <div key={match.talent_id} className="glass-card group hover:border-[#1B4FD8]/30 transition-all p-8 flex flex-col h-full bg-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-[#F8F7F4] rounded-2xl flex items-center justify-center font-extrabold text-[#1B4FD8] text-2xl border border-[var(--border)] shadow-inner uppercase">
                    {match.name?.[0]}
                  </div>
                  <MatchScoreRing score={match.match_percentage} size={50} />
                </div>

                <h3 className="text-xl font-extrabold text-[#0C2D6B] group-hover:text-[#1B4FD8] transition-colors uppercase tracking-tight mb-2">
                  {match.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm font-semibold leading-relaxed mb-6 line-clamp-2">
                  {match.headline}
                </p>

                <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-widest mb-3">Core Expertise</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(match.matched_skills || []).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-[#F0FDF4] border border-[#16A34A]/20 text-[10px] text-[#16A34A] font-extrabold">
                          {skill}
                        </span>
                      ))}
                      {(match.missing_skills || []).slice(0, 2).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-[#F8F7F4] border border-[var(--border)] text-[10px] text-[var(--text-muted)] font-extrabold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Briefcase size={12} className="text-[#16A34A]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Available for Hire</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="p-2 rounded-lg bg-[#F8F7F4] text-[var(--text-secondary)] hover:text-[#1B4FD8] hover:bg-[#EEF5FF] transition-all border border-[var(--border)]">
                      <Mail size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-[#F8F7F4] text-[var(--text-secondary)] hover:text-[#1B4FD8] hover:bg-[#EEF5FF] transition-all border border-[var(--border)]">
                      <LinkIcon size={16} />
                    </button>
                  </div>
                  <button className="premium-button btn-secondary px-6 py-2 text-xs">
                    View Dossier
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
