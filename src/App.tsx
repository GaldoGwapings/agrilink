import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
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

// Protects a route by checking auth session + role
// allowedRole: 'farmer' | 'buyer' — if the logged-in user's role doesn't match, redirect them to their correct dashboard
function ProtectedRoute({ children, allowedRole }: { children: React.ReactElement; allowedRole: 'farmer' | 'buyer' }) {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const check = async () => {
      // Support demo mode (localStorage)
      const demoUserStr = localStorage.getItem('agrilink_user')
      if (demoUserStr) {
        const demoUser = JSON.parse(demoUserStr)
        const role = demoUser.user_metadata?.role || 'farmer'
        if (role === allowedRole) {
          setAuthorized(true)
        } else {
          setRedirectTo(role === 'buyer' ? '/buyer' : '/farmer')
        }
        setChecking(false)
        return
      }

      // Real Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setRedirectTo('/login')
        setChecking(false)
        return
      }

      const role = session.user.user_metadata?.role || 'farmer'
      if (role === allowedRole) {
        setAuthorized(true)
      } else {
        setRedirectTo(role === 'buyer' ? '/buyer' : '/farmer')
      }
      setChecking(false)
    }

    check()
  }, [allowedRole])

  if (checking) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (redirectTo) return <Navigate to={redirectTo} replace />
  if (authorized) return children
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Farmer routes — only accessible if role === 'farmer' */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/home"
        element={
          <ProtectedRoute allowedRole="farmer">
            <LandingPage isLoggedInFarmer={true} user={MOCK_FARMER} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/interested-buyers"
        element={
          <ProtectedRoute allowedRole="farmer">
            <InterestedBuyersPage user={MOCK_FARMER} />
          </ProtectedRoute>
        }
      />

      {/* Buyer routes — only accessible if role === 'buyer' */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRole="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/home"
        element={
          <ProtectedRoute allowedRole="buyer">
            <LandingPage isLoggedInFarmer={false} user={MOCK_BUYER} />
          </ProtectedRoute>
        }
      />

      <Route path="/map" element={<div>Map Page (to be implemented)</div>} />
    </Routes>
  )
}

export default App