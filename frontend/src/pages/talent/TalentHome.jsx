import { useQuery } from '@tanstack/react-query'
import { getTalentProfile } from '../../api/talent'
import { getJobMatches, getConnections } from '../../api/matches'
import ProfileCompleteness from '../../components/shared/ProfileCompleteness'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import PageHeader from '../../components/shared/PageHeader'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { User, Briefcase, Users, Layout } from 'lucide-react'

export default function TalentHome() {
  const { currentUser } = useAuth()
  const { data: profile } = useQuery({
    queryKey: ['talent', 'profile'],
    queryFn: getTalentProfile,
  })

  // Fetch Job Matches (Opportunities) instead of general Startup Matches
  const { data: jobMatches = [] } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: getJobMatches,
  })

  // Fetch Connections to calculate real application count
  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  // Calculate real application count (sent applications with a job_id)
  const applicationsCount = connections?.sent?.filter(c => c.job_id).length || 0
  const topMatches = jobMatches.slice(0, 3)

  return (
    <div>
      <PageHeader title="Talent Dashboard" subtitle={`Welcome back, ${profile?.name || currentUser?.email}`} />

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
          <div className="glass-card p-6 group hover:border-[#1B4FD8]/30 transition-all duration-300 bg-white shadow-sm border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#EEF5FF] rounded-2xl group-hover:bg-[#1B4FD8]/10 transition-colors">
                <User className="text-[#1B4FD8]" size={28} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Profile Readiness</p>
                <p className="text-2xl font-extrabold text-[var(--text-primary)]">{Math.round(profile?.completeness_score || 0)}%</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 group hover:border-[#16A34A]/30 transition-all duration-300 bg-white shadow-sm border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#F0FDF4] rounded-2xl group-hover:bg-[#16A34A]/10 transition-colors">
                <Briefcase className="text-[#16A34A]" size={28} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Applications</p>
                <p className="text-2xl font-extrabold text-[var(--text-primary)]">{applicationsCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 group hover:border-[#1B4FD8]/30 transition-all duration-300 bg-white shadow-sm border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#EEF5FF] rounded-2xl group-hover:bg-[#1B4FD8]/10 transition-colors">
                <Users className="text-[#1B4FD8]" size={28} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Matching Roles</p>
                <p className="text-2xl font-extrabold text-[var(--text-primary)]">{jobMatches.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 bg-white shadow-sm border-[var(--border)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0C2D6B]">Matching Opportunities</h2>
              <p className="text-sm text-[var(--text-secondary)] font-semibold mt-1">Top roles tailored for your skill profile</p>
            </div>
            <Link
              to="/dashboard/talent/opportunities"
              className="px-6 py-2 rounded-full bg-white border border-[var(--border)] text-[11px] font-extrabold uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-[var(--text-secondary)]"
            >
              View All
            </Link>
          </div>

          {topMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topMatches.map((match) => (
                <div key={match.job_id} className="p-6 rounded-2xl bg-[#F8F7F4] border border-[var(--border)] hover:border-[#1B4FD8]/30 transition-all group relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-extrabold text-[#1B4FD8] text-xl overflow-hidden shadow-inner border border-[var(--border)]">
                      {match.startup_name?.[0]}
                    </div>
                    <MatchScoreRing score={match.match_percentage} />
                  </div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-1 group-hover:text-[#1B4FD8] transition-colors">{match.title}</h3>
                  <p className="text-xs font-black text-[#1B4FD8] uppercase tracking-wider mb-2">{match.startup_name}</p>
                  <p className="text-sm text-[var(--text-secondary)] font-semibold line-clamp-2 leading-relaxed">{match.description}</p>
                  <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-1 bg-[#F0FDF4] text-[#16A34A] rounded-full uppercase">{match.job_type || 'Full-time'}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold">{match.location}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Users className="text-slate-600" size={32} />
              </div>
              <p className="text-slate-400 font-medium italic">Scanning ecosystem for matches...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
