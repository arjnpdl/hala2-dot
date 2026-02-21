export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="bg-[var(--secondary)] border-b border-[var(--border)] px-8 py-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0C2D6B] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[var(--text-secondary)] text-sm mt-1 font-semibold">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
