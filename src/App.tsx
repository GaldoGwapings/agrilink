import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import LandingPage from './pages/LandingPage'

const MOCK_USER = {
  id: 'u-1',
  name: 'Juan Dela Cruz',
  region: 'Bukidnon',
  role: 'farmer' as const,
}

function App() {
  const [session, setSession] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState('landing')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setCurrentPage('farmer')
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setCurrentPage('farmer')
      else setCurrentPage('landing')
    })
  }, [])

  if (!session) {
    if (currentPage === 'auth') return <Auth />
    return <LandingPage />
  }

  if (currentPage === 'buyer') return <BuyerDashboard user={MOCK_USER} />
  return <FarmerDashboard user={MOCK_USER} />
}

export default App


