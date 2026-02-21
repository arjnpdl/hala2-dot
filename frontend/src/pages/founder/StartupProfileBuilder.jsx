import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStartupProfile, updateStartupProfile } from '../../api/founders'
import ProfileCompleteness from '../../components/shared/ProfileCompleteness'
import PageHeader from '../../components/shared/PageHeader'
import { useNotification } from '../../contexts/NotificationContext'

export default function StartupProfileBuilder() {
  const { data: profile } = useQuery({
    queryKey: ['founder', 'profile'],
    queryFn: getStartupProfile,
  })
  const queryClient = useQueryClient()
  const { addToast } = useNotification()

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    industry: '',
    stage: '',
    website: '',
    founding_year: '',
    mrr: '',
    user_count: '',
    growth_rate: '',
    funding_goal: '',
    equity_offered: '',
    use_of_funds: '',
    tech_stack: '',
    required_skills: '',
    problem_statement: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        tagline: profile.tagline || '',
        industry: profile.industry || '',
        stage: profile.stage || '',
        website: profile.website || '',
        founding_year: profile.founding_year || '',
        mrr: profile.mrr || '',
        user_count: profile.user_count || '',
        growth_rate: profile.growth_rate || '',
        funding_goal: profile.funding_goal || '',
        equity_offered: profile.equity_offered || '',
        use_of_funds: profile.use_of_funds || '',
        tech_stack: (profile.tech_stack || []).join(', '),
        required_skills: (profile.required_skills || []).join(', '),
        problem_statement: profile.problem_statement || '',
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: updateStartupProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['founder', 'profile'])
      addToast('Profile updated successfully', 'success')
    },
    onError: () => {
      addToast('Failed to update profile', 'error')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      tech_stack: formData.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      required_skills: formData.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
      founding_year: formData.founding_year ? parseInt(formData.founding_year) : null,
      mrr: formData.mrr ? parseFloat(formData.mrr) : null,
      user_count: formData.user_count ? parseInt(formData.user_count) : null,
      growth_rate: formData.growth_rate ? parseFloat(formData.growth_rate) : null,
      funding_goal: formData.funding_goal ? parseFloat(formData.funding_goal) : null,
      equity_offered: formData.equity_offered ? parseFloat(formData.equity_offered) : null,
    }
    updateMutation.mutate(submitData)
  }

  return (
    <div>
      <PageHeader title="Startup Profile" subtitle="Build your startup profile" />

      <div className="p-6">
        {profile && (
          <div className="mb-6">
            <ProfileCompleteness
              score={profile.completeness_score || 0}
              missingFields={[]}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-6 gradient-text">Company Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Founding Year</label>
                <input
                  type="number"
                  value={formData.founding_year}
                  onChange={(e) => setFormData({ ...formData, founding_year: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select stage</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-6 gradient-text">Stage & Traction</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">MRR ($)</label>
                <input
                  type="number"
                  value={formData.mrr}
                  onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">User Count</label>
                <input
                  type="number"
                  value={formData.user_count}
                  onChange={(e) => setFormData({ ...formData, user_count: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Growth Rate (%)</label>
                <input
                  type="number"
                  value={formData.growth_rate}
                  onChange={(e) => setFormData({ ...formData, growth_rate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-6 gradient-text">Funding Ask</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Funding Goal ($)</label>
                <input
                  type="number"
                  value={formData.funding_goal}
                  onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Equity Offered (%)</label>
                <input
                  type="number"
                  value={formData.equity_offered}
                  onChange={(e) => setFormData({ ...formData, equity_offered: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Use of Funds</label>
              <textarea
                value={formData.use_of_funds}
                onChange={(e) => setFormData({ ...formData, use_of_funds: e.target.value })}
                rows="4"
                className="input-field"
              />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-6 gradient-text">Tech & Skills</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tech_stack}
                  onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                  placeholder="React, Python, PostgreSQL"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  placeholder="Full-stack development, Product design"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Problem Statement</label>
                <textarea
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  rows="6"
                  className="input-field"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="premium-button btn-primary"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
