import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInvestorThesis, updateInvestorThesis } from '../../api/investors'
import ProfileCompleteness from '../../components/shared/ProfileCompleteness'
import PageHeader from '../../components/shared/PageHeader'
import { useNotification } from '../../contexts/NotificationContext'

export default function InvestorThesisBuilder() {
  const { data: profile } = useQuery({
    queryKey: ['investor', 'thesis'],
    queryFn: getInvestorThesis,
  })
  const queryClient = useQueryClient()
  const { addToast } = useNotification()

  const [formData, setFormData] = useState({
    name: '',
    fund: '',
    type: '',
    thesis_text: '',
    preferred_sectors: '',
    investment_stage: '',
    check_size_min: '',
    check_size_max: '',
    geography_focus: '',
    key_signals: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        fund: profile.fund || '',
        type: profile.type || '',
        thesis_text: profile.thesis_text || '',
        preferred_sectors: (profile.preferred_sectors || []).join(', '),
        investment_stage: (profile.investment_stage || []).join(', '),
        check_size_min: profile.check_size_min || '',
        check_size_max: profile.check_size_max || '',
        geography_focus: profile.geography_focus || '',
        key_signals: (profile.key_signals || []).join(', '),
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: updateInvestorThesis,
    onSuccess: () => {
      queryClient.invalidateQueries(['investor', 'thesis'])
      addToast('Thesis updated successfully', 'success')
    },
    onError: () => {
      addToast('Failed to update thesis', 'error')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      preferred_sectors: formData.preferred_sectors.split(',').map((s) => s.trim()).filter(Boolean),
      investment_stage: formData.investment_stage.split(',').map((s) => s.trim()).filter(Boolean),
      key_signals: formData.key_signals.split(',').map((s) => s.trim()).filter(Boolean),
      check_size_min: formData.check_size_min ? parseFloat(formData.check_size_min) : null,
      check_size_max: formData.check_size_max ? parseFloat(formData.check_size_max) : null,
    }
    updateMutation.mutate(submitData)
  }

  return (
    <div>
      <PageHeader title="Investment Thesis" subtitle="Define your investment criteria" />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {profile && (
          <div className="w-full">
            <ProfileCompleteness
              score={profile.completeness_score || 0}
              missingFields={[]}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="glass-card p-8 space-y-6">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Investment Philosophy</h3>
              <div>
                <label className="block text-sm font-extrabold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Your Thesis Statement</label>
                <textarea
                  value={formData.thesis_text}
                  onChange={(e) => setFormData({ ...formData, thesis_text: e.target.value })}
                  rows="12"
                  placeholder="Outline your unique perspective on the market, what you look for in founders, and your value-add..."
                  className="input-field leading-relaxed"
                />
              </div>
            </section>

            <section className="glass-card p-8">
              <h3 className="text-xl font-semibold mb-8 gradient-text">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Investor Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Fund / Entity Name</label>
                  <input
                    type="text"
                    value={formData.fund}
                    onChange={(e) => setFormData({ ...formData, fund: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Investor Class</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    <option value="angel">Angel Investor</option>
                    <option value="vc">Venture Capital</option>
                    <option value="diaspora">Diaspora Fund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Geographic Mandate</label>
                  <select
                    value={formData.geography_focus}
                    onChange={(e) => setFormData({ ...formData, geography_focus: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select geography</option>
                    <option value="Nepal-only">Nepal Primary</option>
                    <option value="Nepal + South Asia">Regional (South Asia)</option>
                    <option value="Global">Unrestricted / Global</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass-card p-8">
              <h3 className="text-xl font-semibold mb-6 gradient-text">Target Criteria</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Sectors</label>
                  <input
                    type="text"
                    value={formData.preferred_sectors}
                    onChange={(e) => setFormData({ ...formData, preferred_sectors: e.target.value })}
                    placeholder="Fintech, Healthtech..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Stages</label>
                  <input
                    type="text"
                    value={formData.investment_stage}
                    onChange={(e) => setFormData({ ...formData, investment_stage: e.target.value })}
                    placeholder="SaaS, Pre-seed..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Check Sizes (USD)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={formData.check_size_min}
                      onChange={(e) => setFormData({ ...formData, check_size_min: e.target.value })}
                      placeholder="Min"
                      className="input-field text-center"
                    />
                    <input
                      type="number"
                      value={formData.check_size_max}
                      onChange={(e) => setFormData({ ...formData, check_size_max: e.target.value })}
                      placeholder="Max"
                      className="input-field text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Key Signals</label>
                  <textarea
                    value={formData.key_signals}
                    onChange={(e) => setFormData({ ...formData, key_signals: e.target.value })}
                    placeholder="Founder background, traction metrics..."
                    rows="4"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full premium-button btn-primary"
                >
                  {updateMutation.isPending ? 'Syncing...' : 'Deploy Thesis'}
                </button>
              </div>
            </section>

            <div className="glass-card p-6 bg-[#FEF3C7]/20 border-[#D97706]/20">
              <h4 className="text-sm font-extrabold text-[#D97706] mb-2 uppercase tracking-wide">Pro Tip</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                Be specific about your "anti-thesis" or what you avoid. This improves match quality by 40%.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
