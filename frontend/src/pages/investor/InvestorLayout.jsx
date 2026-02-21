import { Routes, Route } from 'react-router-dom'
import InvestorHome from './InvestorHome'
import InvestorThesisBuilder from './InvestorThesisBuilder'
import DealFlowFeed from './DealFlowFeed'
import DiasporaNetwork from './DiasporaNetwork'
import PortfolioTracker from './PortfolioTracker'

export default function InvestorLayout() {
  return (
    <Routes>
      <Route index element={<InvestorHome />} />
      <Route path="thesis" element={<InvestorThesisBuilder />} />
      <Route path="deal-flow" element={<DealFlowFeed />} />
      <Route path="network" element={<DiasporaNetwork />} />
      <Route path="portfolio" element={<PortfolioTracker />} />
    </Routes>
  )
}
