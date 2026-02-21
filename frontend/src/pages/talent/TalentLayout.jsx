import { Routes, Route } from 'react-router-dom'
import TalentHome from './TalentHome'
import SkillProfileBuilder from './SkillProfileBuilder'
import OpportunityFeed from './OpportunityFeed'
import MyMatchesView from './MyMatchesView'
import MicroGrantBoard from './MicroGrantBoard'

export default function TalentLayout() {
  return (
    <Routes>
      <Route index element={<TalentHome />} />
      <Route path="profile" element={<SkillProfileBuilder />} />
      <Route path="opportunities" element={<OpportunityFeed />} />
      <Route path="matches" element={<MyMatchesView />} />
      <Route path="grants" element={<MicroGrantBoard />} />
    </Routes>
  )
}
