import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getJobMatches, requestConnection } from '../../api/matches'
import { useNotification } from '../../contexts/NotificationContext'
import MatchScoreRing from '../../components/shared/MatchScoreRing'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { Briefcase, MapPin, Clock, DollarSign, Tag, X, Send, CheckCircle } from 'lucide-react'

// ---------- Interest Modal ----------
function InterestModal({ job, onClose, onSend, isPending }) {
  const [message, setMessage] = useState(
    `Hi! I came across the ${job.title} role at ${job.startup_name} and I'm very interested. I believe my skills are a strong match and I'd love to connect.`
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-8 space-y-6 bg-white border-[var(--border)] shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0C2D6B]">Express Interest</h2>
            <p className="text-sm text-[var(--accent)] font-bold mt-1">{job.title} · {job.startup_name}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Your Message
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="input-field resize-none text-sm"
            placeholder="Write a short note about why you're interested..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--primary)] text-sm font-extrabold transition-colors uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(message)}
            disabled={isPending || !message.trim()}
            className="flex-1 premium-button btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span className="animate-pulse">Sending…</span>
            ) : (
              <><Send size={14} /> Send Interest</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Main Feed ----------
export default function OpportunityFeed() {
  const { addToast } = useNotification()
  const [activeJob, setActiveJob] = useState(null)    // job currently open in modal
  const [sentJobs, setSentJobs] = useState(new Set()) // job_ids already sent

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: getJobMatches,
  })

  const interestMutation = useMutation({
    mutationFn: ({ targetId, message, jobId }) => requestConnection(targetId, message, jobId),
    onSuccess: (_, { jobId }) => {
      setSentJobs(prev => new Set([...prev, jobId]))
      setActiveJob(null)
      addToast('Interest sent! The founder will be notified.', 'success')
    },
    onError: () => {
      addToast('Failed to send — please try again.', 'error')
    },
  })

  const handleSend = (message) => {
    if (!activeJob) return
    interestMutation.mutate({
      targetId: activeJob.founder_user_id,
      message,
      jobId: activeJob.job_id,
    })
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="h-10 w-64 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Opportunities" subtitle="High-alpha roles matched to your unique skillset" />

      {/* Interest Modal */}
      {activeJob && (
        <InterestModal
          job={activeJob}
          onClose={() => setActiveJob(null)}
          onSend={handleSend}
          isPending={interestMutation.isPending}
        />
      )}

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Finding your perfect match..."
            message="We're currently scouring the ecosystem for roles that match your unique skillset. Check back soon!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((opp) => {
              const alreadySent = sentJobs.has(opp.job_id)
              return (
                <div key={opp.job_id} className="glass-card group hover:border-[#1B4FD8]/30 transition-all p-8 flex flex-col h-full bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-extrabold text-[#0C2D6B] group-hover:text-[#1B4FD8] transition-colors uppercase tracking-tight leading-tight">
                        {opp.title}
                      </h3>
                      <p className="text-[#1B4FD8] mt-1 uppercase tracking-[0.1em] text-[10px] font-extrabold">
                        {opp.startup_name} • {opp.industry}
                      </p>
                    </div>
                    <MatchScoreRing score={opp.match_percentage} size={50} />
                  </div>

                  <div className="space-y-2.5 mb-5 flex-1">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin size={13} className="text-[#1B4FD8] shrink-0" />
                      <span className="text-xs font-semibold">{opp.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Clock size={13} className="text-[#1B4FD8] shrink-0" />
                      <span className="text-xs capitalize font-semibold">{opp.job_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <DollarSign size={13} className="text-[#1B4FD8] shrink-0" />
                      <span className="text-xs text-[var(--text-primary)] font-extrabold">{opp.compensation || 'Competitive'}</span>
                    </div>

                    {opp.required_skills?.length > 0 && (
                      <div className="pt-1">
                        <div className="flex items-center gap-1 text-[var(--text-secondary)] text-[10px] uppercase font-extrabold mb-2 tracking-wider">
                          <Tag size={10} /> Skills Needed
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {opp.required_skills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#1B4FD8] text-[10px] font-extrabold border border-[#1B4FD8]/10"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {opp.description && (
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 pt-1">
                        {opp.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-5 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wide">Skill Match</span>
                      <span className={`text-[10px] font-extrabold uppercase mt-0.5 ${opp.match_percentage >= 70 ? 'text-[#16A34A]' : opp.match_percentage >= 40 ? 'text-[#D97706]' : 'text-[var(--text-secondary)]'}`}>
                        {opp.match_percentage >= 70 ? 'Strong' : opp.match_percentage >= 40 ? 'Partial' : 'Open'}
                      </span>
                    </div>

                    {alreadySent ? (
                      <div className="flex items-center gap-1.5 text-[#16A34A] text-xs font-extrabold uppercase">
                        <CheckCircle size={14} /> Interest Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveJob(opp)}
                        className="premium-button btn-primary px-5 py-2 text-sm"
                      >
                        Express Interest
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
