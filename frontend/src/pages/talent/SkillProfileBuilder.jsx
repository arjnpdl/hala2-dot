import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTalentProfile, updateTalentProfile } from '../../api/talent'
import ProfileCompleteness from '../../components/shared/ProfileCompleteness'
import PageHeader from '../../components/shared/PageHeader'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../hooks/useAuth'
import { FileText, Mail } from 'lucide-react'
import client from '../../api/client'

export default function SkillProfileBuilder() {
  const { currentUser } = useAuth()
  const { data: profile } = useQuery({
    queryKey: ['talent', 'profile'],
    queryFn: getTalentProfile,
  })
  const queryClient = useQueryClient()
  const { addToast } = useNotification()

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    location: '',
    bio: '',
    experience_level: '',
  })

  const [skills, setSkills] = useState([])
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        headline: profile.headline || '',
        location: profile.location || '',
        bio: profile.bio || '',
        experience_level: profile.experience_level || '',
      })
      setSkills(profile.skills || [])
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: updateTalentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['talent', 'profile'])
      addToast('Profile updated successfully', 'success')
    },
    onError: () => {
      addToast('Failed to update profile', 'error')
    },
  })

  const handleCvUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await client.post('/talent/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      addToast('CV uploaded successfully', 'success')
      queryClient.invalidateQueries(['talent', 'profile'])
    } catch (error) {
      addToast('Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate({
      ...formData,
      skills
    })
  }

  const addSkill = (name, proficiency = 'Intermediate') => {
    if (name && !skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills([...skills, { name, proficiency }])
    }
  }

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  return (
    <div>
      <PageHeader title="Talent Profile" subtitle="Build your high-fidelity professional profile" />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {profile && (
          <ProfileCompleteness
            score={profile.completeness_score || 0}
            missingFields={[]}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8 bg-white">
              <section>
                <h3 className="text-xl font-extrabold mb-6 text-[#0C2D6B] tracking-tight">Professional Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        readOnly
                        className="input-field pl-9 text-[var(--text-muted)] cursor-not-allowed bg-[#F8F7F4]"
                        title="Email cannot be changed"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold">Account email — cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Headline</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g., Full-stack Developer"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Experience Level</label>
                    <select
                      value={formData.experience_level}
                      onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select level</option>
                      <option value="student">Student</option>
                      <option value="junior">Junior (1-2y)</option>
                      <option value="mid">Mid-level (3-5y)</option>
                      <option value="senior">Senior (5y+)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="4"
                    className="input-field"
                  />
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="premium-button btn-primary"
                >
                  {updateMutation.isPending ? 'Syncing...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <section className="glass-card p-8 bg-white">
              <h3 className="text-xl font-extrabold mb-6 text-[#0C2D6B] tracking-tight">Documents & Assets</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center border-[1.5px] border-dashed border-[var(--border)] rounded-2xl p-8 bg-[#F8F7F4]">
                <div className="w-16 h-16 bg-[#EEF5FF] rounded-2xl flex items-center justify-center text-[#1B4FD8] border border-[#1B4FD8]/10 shadow-inner">
                  <FileText size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-extrabold text-[#0C2D6B] uppercase tracking-tight">Upload Professional CV</h4>
                  <p className="text-sm text-[var(--text-secondary)] font-semibold mt-1">PDF, DOCX up to 5MB. This helps founders find you.</p>
                  {profile?.cv_path && (
                    <p className="text-xs text-[#16A34A] mt-2 font-extrabold uppercase">✓ Currently: {profile.cv_path.split('/').pop()}</p>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={handleCvUpload} accept=".pdf,.doc,.docx" disabled={uploading} />
                  <div className="premium-button btn-secondary">
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Skills UI */}
          <div className="space-y-8">
            <section className="glass-card p-8 bg-white">
              <h3 className="text-xl font-extrabold mb-6 text-[#0C2D6B] tracking-tight text-center uppercase">Core Skills</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="skillInput"
                    placeholder="Add skill (e.g. React)"
                    className="input-field py-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('skillInput');
                      addSkill(input.value);
                      input.value = '';
                    }}
                    className="premium-button btn-primary px-4"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 justify-center">
                  {skills.length > 0 ? skills.map((skill, idx) => (
                    <div key={idx} className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF5FF] border border-[#1B4FD8]/10 hover:border-[#1B4FD8]/30 transition-all shadow-sm">
                      <span className="text-xs font-extrabold text-[#1B4FD8]">{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-[var(--text-muted)] hover:bg-[#DC2626] hover:text-white transition-colors text-[10px] shadow-sm border border-[#1B4FD8]/10"
                      >
                        ✕
                      </button>
                    </div>
                  )) : (
                    <p className="text-sm text-[var(--text-muted)] font-semibold italic py-4">No skills added yet. Add your core expertise.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <h4 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest mb-4 text-center">Quick Add</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Product Design', 'React', 'Python', 'Sales', 'Marketing', 'SQL'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-[#F8F7F4] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[#EEF5FF] hover:text-[#1B4FD8] hover:border-[#1B4FD8]/20 transition-all uppercase"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
