import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllInvestors } from '../../api/investors'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { Users, Search, Filter, Mail, Link } from 'lucide-react'

export default function DiasporaNetwork() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: investors = [], isLoading } = useQuery({
    queryKey: ['investors', 'all'],
    queryFn: getAllInvestors,
  })

  const filteredInvestors = investors.filter(inv =>
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.preferred_sectors || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <PageHeader title="Diaspora Network" subtitle="Global capital, local impact. Connect with your peers." />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, fund, or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 py-3 w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="premium-button btn-secondary flex items-center gap-2 px-6">
              <Filter size={18} /> Filters
            </button>
            <button className="premium-button btn-primary px-6">
              Invite Peer
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />)}
          </div>
        ) : filteredInvestors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Peer directory empty"
            message="We couldn't find any investors matching your search criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInvestors.map((inv) => (
              <div key={inv.id} className="glass-card group hover:border-[var(--accent)]/30 transition-all p-8 flex flex-col h-full bg-white">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-[var(--elevated)] rounded-2xl flex items-center justify-center font-black text-[var(--accent)] text-2xl border border-[var(--border)] shadow-inner uppercase">
                    {inv.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">
                      {inv.name}
                    </h3>
                    <p className="text-xs font-black text-[var(--accent)] mt-1 uppercase tracking-widest leading-none">
                      {inv.fund} • {inv.type}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Focus Sectors</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(inv.preferred_sectors || []).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-[var(--elevated)] border border-[var(--border)] text-[10px] text-[var(--text-primary)] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Mandate</h4>
                    <p className="text-xs text-[var(--text-primary)] font-bold">{inv.geography_focus}</p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="p-2 rounded-lg bg-[var(--elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all">
                      <Mail size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-[var(--elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all">
                      <Link size={16} />
                    </button>
                  </div>
                  <button className="premium-button btn-secondary px-6 py-2 text-xs">
                    View Thesis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
