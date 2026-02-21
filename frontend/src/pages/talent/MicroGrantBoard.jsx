import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import { FileText } from 'lucide-react'

export default function MicroGrantBoard() {
  return (
    <div>
      <PageHeader title="Grants & Competitions" subtitle="Find funding opportunities" />
      <div className="p-6">
        <EmptyState
          icon={FileText}
          title="Coming Soon"
          message="Grants board will be available soon"
        />
      </div>
    </div>
  )
}
