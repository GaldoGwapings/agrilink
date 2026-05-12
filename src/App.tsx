import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import InterestedBuyersPage from './pages/InterestedBuyersPage'

const MOCK_FARMER = {
  id: 'u-1',
  name: 'Juan Dela Cruz',
  region: 'Bukidnon',
  role: 'farmer' as const,
}

const MOCK_BUYER = {
  id: 'u-2',
  name: 'Juan Dela Cruz',
  region: 'Bukidnon',
  role: 'buyer' as const,
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/farmer" element={<FarmerDashboard user={MOCK_USER} />} />
      <Route path="/farmer/home" element={<LandingPage isLoggedInFarmer={true} user={MOCK_USER} />} />
      <Route path="/farmer/interested-buyers" element={<InterestedBuyersPage user={MOCK_USER} />} />
      <Route path="/buyer" element={<BuyerDashboard user={MOCK_USER} />} />
      <Route path="/buyer/home" element={<LandingPage isLoggedInBuyer={true} user={MOCK_USER} />} />
      <Route path="/map" element={<div>Map Page (to be implemented)</div>} />
      
  )
}
export default App