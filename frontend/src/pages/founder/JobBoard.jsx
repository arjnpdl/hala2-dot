import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyJobs, createJob, updateJob, deleteJob } from '../../api/founders'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { Briefcase, Plus, Trash2, MapPin, DollarSign, Clock, X, Pencil, Check, Tag, Users, UserCheck } from 'lucide-react'
import { useNotification } from '../../contexts/NotificationContext'
import { getTalentMatches, getJobApplicants } from '../../api/matches'
import MatchScoreRing from '../../components/shared/MatchScoreRing'

const EMPTY_FORM = {
    title: '',
    description: '',
    requirements: '',
    required_skills: [],
    location: '',
    job_type: 'full-time',
    compensation: '',
}

function JobFormModal({ initial = EMPTY_FORM, onClose, onSubmit, isPending, title }) {
    const [form, setForm] = useState({ ...initial, required_skills: initial.required_skills || [] })
    const [skillInput, setSkillInput] = useState('')

    const addSkill = () => {
        const s = skillInput.trim()
        if (s && !form.required_skills.includes(s)) {
            setForm(f => ({ ...f, required_skills: [...f.required_skills, s] }))
        }
        setSkillInput('')
    }

    const removeSkill = (skill) => setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s !== skill) }))

    const handleKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }

    const handleSubmit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-2xl p-8 space-y-6 relative bg-white max-h-[90vh] overflow-y-auto border-[var(--border)] shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-extrabold text-[#0C2D6B] tracking-tight">{title}</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Role Title *</label>
                            <input
                                required
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Lead Engineer, Growth Lead"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Location</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="Remote, Kathmandu, etc."
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Job Type</label>
                            <select
                                value={form.job_type}
                                onChange={e => setForm({ ...form, job_type: e.target.value })}
                                className="input-field"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="equity-only">Equity Only</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Compensation Range</label>
                            <input
                                type="text"
                                value={form.compensation}
                                onChange={e => setForm({ ...form, compensation: e.target.value })}
                                placeholder="e.g. $2k - $4k / month + 1% Equity"
                                className="input-field"
                            />
                        </div>

                        {/* Required Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Required Skills</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Type a skill and press Enter..."
                                    className="input-field flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="premium-button btn-secondary px-4"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            {form.required_skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {form.required_skills.map(skill => (
                                        <span
                                            key={skill}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF5FF] text-[#1B4FD8] text-[10px] font-extrabold border border-[#1B4FD8]/10"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-[var(--text-muted)] font-semibold mt-2">These skills will be used to match talent to this role.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                rows="4"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="What will they build?"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="premium-button btn-secondary px-6">Cancel</button>
                        <button type="submit" disabled={isPending} className="premium-button btn-primary px-8">
                            {isPending ? 'Saving...' : <><Check size={16} className="inline mr-2" />Save Posting</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function MatchedTalentsModal({ jobId, onClose }) {
    const normalizedJobId = typeof jobId === 'object' ? null : String(jobId)
    const { data: matches = [], isLoading } = useQuery({
        queryKey: ['jobMatches', normalizedJobId],
        queryFn: () => getTalentMatches(normalizedJobId),
        enabled: !!normalizedJobId && normalizedJobId !== "[object Object]"
    })

    // Sort by match percentage, show matches > 50%
    const sortedMatches = [...(matches || [])]
        .filter(m => m.match_percentage > 50)
        .sort((a, b) => b.match_percentage - a.match_percentage)

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-4xl p-8 space-y-6 relative bg-white max-h-[90vh] overflow-y-auto border-[var(--border)] shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <X size={24} />
                </button>

                <div>
                    <h3 className="text-2xl font-extrabold text-[#0C2D6B] tracking-tight">Matched High-Caliber Talent</h3>
                    <p className="text-[var(--text-secondary)] font-semibold text-sm mt-1">Discover candidates whose skills align perfectly with this role.</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl" />)}
                    </div>
                ) : sortedMatches.length === 0 ? (
                    <EmptyState icon={Users} title="No precise matches yet" message="Adjust the required skills to broaden your pipeline." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedMatches.map(match => (
                            <div key={match.talent_id} className="glass-card p-6 bg-[#F8F7F4] border-[var(--border)] hover:border-[#1B4FD8]/30 transition-all flex items-start gap-4">
                                <div className="flex-1">
                                    <h4 className="font-extrabold text-[var(--text-primary)] uppercase tracking-tight">{match.name}</h4>
                                    <p className="text-xs text-[var(--text-secondary)] font-semibold mb-3">{match.headline}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {match.matched_skills?.map(s => (
                                            <span key={s} className="px-2 py-0.5 rounded-md bg-[#EEF5FF] text-[#1B4FD8] text-[10px] font-extrabold border border-[#1B4FD8]/20">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <MatchScoreRing score={match.match_percentage} size={45} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function ApplicantsModal({ jobId, onClose }) {
    const normalizedJobId = typeof jobId === 'object' ? null : String(jobId)
    const { data: applicants = [], isLoading } = useQuery({
        queryKey: ['jobApplicants', normalizedJobId],
        queryFn: () => getJobApplicants(normalizedJobId),
        enabled: !!normalizedJobId && normalizedJobId !== "[object Object]"
    })

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-2xl p-8 space-y-6 relative bg-white max-h-[90vh] overflow-y-auto border-[var(--border)] shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <X size={24} />
                </button>

                <div>
                    <h3 className="text-2xl font-extrabold text-[#16A34A] tracking-tight">Interested Applicants</h3>
                    <p className="text-[var(--text-secondary)] font-semibold text-sm mt-1">Talents who have expressed interest in this specific opportunity.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />)}
                    </div>
                ) : applicants.length === 0 ? (
                    <EmptyState icon={UserCheck} title="No applicants yet" message="Potential candidates are currently reviewing your posting." />
                ) : (
                    <div className="space-y-4">
                        {applicants.map(app => (
                            <div key={app.match_id} className="glass-card p-6 bg-[#F8F7F4] border-[var(--border)] hover:border-[#16A34A]/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-extrabold text-[var(--text-primary)] uppercase tracking-tight">{app.name}</h4>
                                    <span className="text-[10px] font-extrabold text-[#16A34A] uppercase px-2 py-1 bg-[#F0FDF4] rounded-full border border-[#16A34A]/10">
                                        Interested
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] font-semibold mb-4">{app.headline}</p>
                                {app.message && (
                                    <div className="p-3 bg-white rounded-lg border border-[var(--border)] italic text-sm text-[var(--text-secondary)]">
                                        "{app.message}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function JobBoard() {
    const [isAdding, setIsAdding] = useState(false)
    const [editingJob, setEditingJob] = useState(null)
    const [viewingMatches, setViewingMatches] = useState(null)
    const [viewingApplicants, setViewingApplicants] = useState(null)

    const queryClient = useQueryClient()
    const { addToast } = useNotification()

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['founder', 'jobs'],
        queryFn: getMyJobs
    })

    const createMutation = useMutation({
        mutationFn: createJob,
        onSuccess: () => {
            queryClient.invalidateQueries(['founder', 'jobs'])
            setIsAdding(false)
            addToast('Job posting live!', 'success')
        },
        onError: (err) => addToast(err?.response?.data?.detail || 'Failed to create posting', 'error')
    })

    const updateMutation = useMutation({
        mutationFn: updateJob,
        onSuccess: () => {
            queryClient.invalidateQueries(['founder', 'jobs'])
            setEditingJob(null)
            addToast('Job posting updated!', 'success')
        },
        onError: (err) => addToast(err?.response?.data?.detail || 'Failed to update posting', 'error')
    })

    const deleteMutation = useMutation({
        mutationFn: deleteJob,
        onSuccess: () => {
            queryClient.invalidateQueries(['founder', 'jobs'])
            addToast('Job removed', 'success')
        }
    })

    const handleCreate = (formData) => createMutation.mutate(formData)
    const handleUpdate = (formData) => updateMutation.mutate({ jobId: editingJob.id, ...formData })

    return (
        <div>
            <PageHeader title="Job Postings" subtitle="Enlist top talent to build the future of your venture." />

            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-[#0C2D6B]">Active Opportunities</h2>
                    <button onClick={() => setIsAdding(true)} className="premium-button btn-primary flex items-center gap-2 py-2 px-6">
                        <Plus size={18} /> Post Job
                    </button>
                </div>

                {/* Create Modal */}
                {isAdding && (
                    <JobFormModal
                        title="New Job Posting"
                        onClose={() => setIsAdding(false)}
                        onSubmit={handleCreate}
                        isPending={createMutation.isPending}
                    />
                )}

                {/* Matches Modal */}
                {viewingMatches && (
                    <MatchedTalentsModal
                        jobId={viewingMatches}
                        onClose={() => setViewingMatches(null)}
                    />
                )}

                {/* Applicants Modal */}
                {viewingApplicants && (
                    <ApplicantsModal
                        jobId={viewingApplicants}
                        onClose={() => setViewingApplicants(null)}
                    />
                )}

                {/* Edit Modal */}
                {editingJob && (
                    <JobFormModal
                        title="Edit Job Posting"
                        initial={editingJob}
                        onClose={() => setEditingJob(null)}
                        onSubmit={handleUpdate}
                        isPending={updateMutation.isPending}
                    />
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => <div key={i} className="glass-card h-56 animate-pulse bg-white/5" />)}
                    </div>
                ) : jobs.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title="No active roles"
                        message="Broadcast your requirements to our network of high-caliber talent."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {jobs.map((job) => (
                            <div key={job.id} className="glass-card p-8 group border-[var(--border)] hover:border-[#16A34A]/30 transition-all bg-white relative">
                                {/* Action Buttons */}
                                <div className="absolute top-5 right-5 flex gap-2">
                                    <button
                                        onClick={() => setEditingJob(job)}
                                        className="p-2 rounded-lg bg-amber-50 text-amber-500/60 hover:text-amber-600 hover:bg-amber-100 transition-all"
                                        title="Edit"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => deleteMutation.mutate(job.id)}
                                        disabled={deleteMutation.isPending}
                                        className="p-2 rounded-lg bg-red-50 text-red-500/60 hover:text-red-600 hover:bg-red-100 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                <div className="flex flex-col h-full">
                                    <div className="flex-1 space-y-4 pr-16">
                                        <h3 className="text-xl font-extrabold text-[#0C2D6B] group-hover:text-[#16A34A] transition-colors uppercase tracking-tight">
                                            {job.title}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                                <MapPin size={13} className="text-[#16A34A]" />
                                                <span className="text-xs font-semibold">{job.location || 'Remote'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                                <Clock size={13} className="text-[#16A34A]" />
                                                <span className="text-xs capitalize font-semibold">{job.job_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[var(--text-secondary)] col-span-2">
                                                <DollarSign size={13} className="text-[#16A34A]" />
                                                <span className="text-xs text-[var(--text-primary)] font-extrabold">{job.compensation || 'Competitive'}</span>
                                            </div>
                                        </div>

                                        {/* Skill Tags */}
                                        {job.required_skills?.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[10px] font-extrabold uppercase tracking-wide">
                                                    <Tag size={10} /> Required Skills
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.required_skills.map(skill => (
                                                        <span
                                                            key={skill}
                                                            className="px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] text-[10px] font-extrabold border border-[#16A34A]/10"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-sm text-[var(--text-secondary)] font-semibold leading-relaxed line-clamp-2">
                                            {job.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-[var(--border)] grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setViewingApplicants(job.id)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all font-extrabold text-[11px] uppercase tracking-wider"
                                        >
                                            <UserCheck size={14} /> View Applicants
                                        </button>
                                        <button
                                            onClick={() => setViewingMatches(job.id)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] transition-all font-extrabold text-[11px] uppercase tracking-wider"
                                        >
                                            <Users size={14} /> View Matches
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
