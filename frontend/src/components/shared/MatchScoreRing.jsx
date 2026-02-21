export default function MatchScoreRing({ score, size = 96 }) {
  const radius = (size / 2) - 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(score || 0, 100) / 100) * circumference

  const color =
    score >= 70 ? '#10b981'   // emerald
      : score >= 40 ? '#f59e0b' // amber
        : '#ef4444'               // red

  const svgSize = size

  return (
    <div className="relative shrink-0" style={{ width: svgSize, height: svgSize }}>
      <svg
        width={svgSize}
        height={svgSize}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth="5"
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-black text-[var(--text-primary)]"
          style={{ fontSize: svgSize * 0.21 }}
        >
          {Math.round(score || 0)}%
        </span>
      </div>
    </div>
  )
}
