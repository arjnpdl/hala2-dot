import { useQuery } from '@tanstack/react-query'
import { getInvestorThesis } from '../../api/investors'
import { getInvestorMatches } from '../../api/matches'
import ProfileCompleteness from '../../components/shared/ProfileCompleteness'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import PageHeader from '../../components/shared/PageHeader'
import { TrendingUp, Briefcase, Users } from 'lucide-react'

export default function InvestorHome() {
  const { data: profile } = useQuery({
    queryKey: ['investor', 'thesis'],
    queryFn: getInvestorThesis,
  })

  const { data: matches = [] } = useQuery({
    queryKey: ['investorMatches'],
    queryFn: getInvestorMatches,
  })

  // Only show high-fidelity matches (> 50%)
  const filteredMatches = matches.filter(m => m.match_percentage > 50)
  const topMatches = filteredMatches.slice(0, 3)

  return (
    <div>
      <PageHeader title="Investor Dashboard" subtitle="Manage your deal flow and portfolio" />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {profile?.completeness_score < 80 && (
          <div className="w-full">
            <ProfileCompleteness
              score={profile.completeness_score || 0}
              missingFields={[]}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 group hover:border-[#1B4FD8]/30 transition-all duration-300 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#EEF5FF] rounded-2xl group-hover:bg-[#1B4FD8]/10 transition-colors">
                <TrendingUp className="text-[#1B4FD8]" size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Pipeline</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-extrabold text-[var(--text-primary)]">{matches.length}</p>
                  <p className="text-[10px] text-[#16A34A] font-extrabold mb-1">+24%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 group hover:border-[#16A34A]/30 transition-all duration-300 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#F0FDF4] rounded-2xl group-hover:bg-[#16A34A]/10 transition-colors">
                <Briefcase className="text-[#16A34A]" size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Portfolio</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-extrabold text-[var(--text-primary)]">$650k</p>
                  <p className="text-[10px] text-[#16A34A] font-extrabold mb-1">2 Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 group hover:border-[#D97706]/30 transition-all duration-300 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#FEF9EE] rounded-2xl group-hover:bg-[#D97706]/10 transition-colors">
                <Users className="text-[#D97706]" size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Network</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-extrabold text-[var(--text-primary)]">0</p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-extrabold mb-1">Founders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0C2D6B]">High Resolution Deal Flow</h2>
              <p className="text-sm text-[var(--text-secondary)] font-semibold mt-1">AI-indexed founders matching your specific thesis signals</p>
            </div>
          </div>

          {topMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topMatches.map((match) => (
                <div key={match.startup_id} className="glass-card group hover:border-[#1B4FD8]/30 transition-all p-8 flex flex-col h-full bg-white">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-[#F8F7F4] rounded-2xl flex items-center justify-center font-extrabold text-[#1B4FD8] text-2xl border border-[var(--border)] shadow-inner uppercase">
                      {match.name?.[0]}
                    </div>
                    <MatchScoreRing score={match.match_percentage} size={50} />
                  </div>

                  <h3 className="text-xl font-extrabold text-[var(--text-primary)] group-hover:text-[#1B4FD8] transition-colors uppercase tracking-tight mb-2">
                    {match.name}
                  </h3>
                  <p className="text-[var(--text-secondary)] font-semibold text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                    {match.tagline}
                  </p>

                  <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wide">Sector Match</span>
                      <span className="text-[10px] text-[#16A34A] font-extrabold uppercase mt-1">Optimized</span>
                    </div>
                    <button className="premium-button btn-secondary px-6 py-2 text-xs">
                      Deep Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card py-20 text-center bg-white border-[var(--border)]">
              <div className="w-20 h-20 bg-[var(--elevated)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
                <Briefcase className="text-[var(--text-secondary)]" size={40} />
              </div>
              <h4 className="text-lg font-extrabold text-[var(--accent)]">Pipeline Empty</h4>
              <p className="text-[var(--text-secondary)] mt-2 max-w-sm mx-auto text-sm font-medium">Our engines are scanning for new founders. Refine your thesis to increase match fidelity.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
