import { Routes, Route } from 'react-router-dom'
import FounderHome from './FounderHome'
import StartupProfileBuilder from './StartupProfileBuilder'
import TalentMatchList from './TalentMatchList'
import InvestorMatchList from './InvestorMatchList'
import PitchCoPilot from './PitchCoPilot'
import TeamGapAnalysis from './TeamGapAnalysis'
import JobBoard from './JobBoard'

export default function FounderLayout() {
  return (
    <Routes>
      <Route index element={<FounderHome />} />
      <Route path="profile" element={<StartupProfileBuilder />} />
      <Route path="investor-matches" element={<InvestorMatchList />} />
      <Route path="team-gaps" element={<TeamGapAnalysis />} />
      <Route path="jobs" element={<JobBoard />} />
    </Routes>
  )
}
