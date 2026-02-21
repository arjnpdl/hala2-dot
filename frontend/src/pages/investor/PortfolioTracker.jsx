import { useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { Briefcase, TrendingUp, ArrowUpRight, Plus, ExternalLink, Calendar } from 'lucide-react'

export default function PortfolioTracker() {
  const [portfolio] = useState([
    {
      id: 1,
      name: 'EcoStream AI',
      industry: 'Sustainability',
      stage: 'Seed',
      invested: 150000,
      valuation: 450000,
      date: 'Dec 2025',
      status: 'High Growth',
      logo: 'E'
    },
    {
      id: 2,
      name: 'Nexus Fintech',
      industry: 'Fintech',
      stage: 'Series-A',
      invested: 500000,
      valuation: 1200000,
      date: 'Aug 2024',
      status: 'Stable',
      logo: 'N'
    }
  ])

  return (
    <div>
      <PageHeader title="Portfolio Management" subtitle="Track performance and manage your capital allocations." />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 bg-white">
            <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Total Invested</p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">$650,000</p>
          </div>
          <div className="glass-card p-6 bg-white border-[#16A34A]/10">
            <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Current Value</p>
            <p className="text-2xl font-extrabold text-[#16A34A] mt-1">$1,650,000</p>
          </div>
          <div className="glass-card p-6 bg-white border-[#D97706]/10">
            <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Unrealized MOIC</p>
            <p className="text-2xl font-extrabold text-[#D97706] mt-1">2.54x</p>
          </div>
          <div className="glass-card p-6 bg-white">
            <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Active Logos</p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{portfolio.length}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#0C2D6B]">Asset Inventory</h2>
            <button className="premium-button btn-primary flex items-center gap-2 py-2 px-6">
              <Plus size={18} /> New Investment
            </button>
          </div>

          {portfolio.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Portfolio empty"
              message="Your investment history and performance metrics will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {portfolio.map((company) => (
                <div key={company.id} className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-[#1B4FD8]/30 transition-all bg-white">
                  <div className="w-14 h-14 bg-[#F8F7F4] rounded-xl flex items-center justify-center font-extrabold text-[#1B4FD8] text-xl border border-[var(--border)] shadow-inner">
                    {company.logo}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-extrabold text-[#0C2D6B] group-hover:text-[#1B4FD8] transition-colors uppercase tracking-tight">
                      {company.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-widest mt-1">
                      {company.industry} • {company.stage}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 flex-[2]">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Invested</p>
                      <p className="text-sm font-extrabold text-[var(--text-primary)] mt-1">${company.invested.toLocaleString()}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Current Value</p>
                      <p className="text-sm font-extrabold text-[#16A34A] mt-1">${company.valuation.toLocaleString()}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest text-center">Date</p>
                      <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mt-1 font-bold">
                        <Calendar size={12} />
                        <span className="text-xs">{company.date}</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Status</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] text-[10px] font-extrabold uppercase border border-[#16A34A]/10">
                        {company.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-[#F8F7F4] text-[var(--text-secondary)] hover:text-[#1B4FD8] transition-all border border-[var(--border)] hover:border-[#1B4FD8]/30">
                      <ExternalLink size={18} />
                    </button>
                    <button className="p-2 rounded-lg bg-[#F8F7F4] text-[var(--text-secondary)] hover:text-[#1B4FD8] transition-all border border-[var(--border)] hover:border-[#1B4FD8]/30">
                      <TrendingUp size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
