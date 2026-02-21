import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../contexts/NotificationContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('FOUNDER')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { addToast } = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email, password, role)
      addToast('Registration successful. Please login.', 'success')
      navigate('/login')
    } catch (error) {
      addToast(error.response?.data?.detail || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary)] p-4">
      <div className="max-w-md w-full glass-card p-10 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]"></div>

        <h1 className="text-4xl font-extrabold text-center mb-2 text-[#0C2D6B]">Join NepLaunch</h1>
        <p className="text-center text-[var(--text-secondary)] font-semibold mb-10">Nepal's Premier Startup Ecosystem</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-[#0C2D6B] mb-2 uppercase tracking-wide">
              Join as a...
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="FOUNDER">Founder or Co-Founder</option>
              <option value="TALENT">Skilled Talent / Freelancer</option>
              <option value="INVESTOR">Angel / VC Investor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button btn-primary mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[var(--text-secondary)] font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-extrabold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
