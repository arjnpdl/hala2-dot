export default function ProfileCompleteness({ score, missingFields = [], noCard = false }) {
  const pct = Math.round(score || 0)

  const color =
    pct >= 80
      ? { bar: 'bg-[#16A34A]', text: 'text-[#16A34A]', glow: 'shadow-[#16A34A]/20' }
      : pct >= 50
        ? { bar: 'bg-[#D97706]', text: 'text-[#D97706]', glow: 'shadow-[#D97706]/20' }
        : { bar: 'bg-[#DC2626]', text: 'text-[#DC2626]', glow: 'shadow-[#DC2626]/20' }

  const label = pct >= 80 ? 'Strong' : pct >= 50 ? 'Building' : 'Incomplete'

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-[#0C2D6B] uppercase tracking-wider">Profile Completeness</h3>
          <p className="text-xs text-[var(--text-secondary)] font-bold mt-0.5">{label}</p>
        </div>
        <span className={`text-3xl font-black ${color.text}`}>{pct}<span className="text-lg">%</span></span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--primary)] rounded-full h-2.5 overflow-hidden border border-[var(--border)]">
        <div
          className={`${color.bar} h-2.5 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {missingFields.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Missing fields</p>
          <ul className="space-y-1">
            {missingFields.map((field, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  if (noCard) return content

  return (
    <div className="glass-card p-6 bg-white border-[var(--border)] shadow-sm">
      {content}
    </div>
  )
}
