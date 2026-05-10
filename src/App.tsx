import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'

const MOCK_USER = {
  id: 'u-1',
  name: 'Juan Dela Cruz',
  region: 'Bukidnon',
  role: 'farmer' as const,
}

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={session ? <Navigate to="/farmer" /> : <LoginPage />} />
      <Route path="/farmer" element={session ? <FarmerDashboard user={MOCK_USER} /> : <Navigate to="/login" />} />
      <Route path="/buyer" element={session ? <BuyerDashboard user={MOCK_USER} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App