import { useState, useEffect } from 'react'
import type { Harvest } from '../types'
import { MOCK_HARVESTS } from '../mockData'
import HarvestCard from '../components/HarvestCard'
import HarvestForm from '../components/HarvestForm'
import { Plus, LayoutGrid, List, Sprout, Sparkles, X, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { getSmartListingRecommendations } from '../lib/gemini'

export default function FarmerDashboard() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true)
      const demoUserStr = localStorage.getItem('agrilink_user')
      if (demoUserStr) {
        const demoUser = JSON.parse(demoUserStr)
        setUser(demoUser)
        setProfile(demoUser.user_metadata)
        setLoadingUser(false)
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setProfile(session.user.user_metadata)
      }
      setLoadingUser(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        setProfile(session.user.user_metadata)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        localStorage.removeItem('agrilink_user')
        localStorage.removeItem('agrilink_auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const [harvests, setHarvests] = useState<Harvest[]>(() => {
    const saved = localStorage.getItem('harvests')
    if (saved) return JSON.parse(saved)
    return MOCK_HARVESTS
  })

  useEffect(() => {
    if (harvests.length) {
      localStorage.setItem('harvests', JSON.stringify(harvests))
    }
  }, [harvests])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null)
  const [viewState, setViewState] = useState<'grid' | 'list'>('grid')
  const [aiRecommendation, setAiRecommendation] = useState<any>(null)

  // ✅ AI only runs when user clicks the button — not automatically
  const fetchRecommendations = async () => {
    if (harvests.length === 0 || !profile) return
    setLoadingAI(true)
    setAiRecommendation(null)
    const latestHarvest = harvests[0]
    const provinceName = latestHarvest.province || profile.location || 'Bukidnon'
    const cropTypeName = latestHarvest.cropType || 'crop'
    const rec = await getSmartListingRecommendations(
      cropTypeName,
      provinceName,
      latestHarvest.harvestDate || new Date().toISOString().split('T')[0]
    )
    setAiRecommendation(rec)
    setLoadingAI(false)
  }

  const handleDeleteHarvest = (id: string) => {
    setHarvests(harvests.filter(h => h.id !== id))
  }

  const handleAddHarvest = (newHarvest: Partial<Harvest>) => {
    if (editingHarvest) {
      setHarvests(harvests.map(h => h.id === editingHarvest.id ? { ...h, ...newHarvest } as Harvest : h))
      setEditingHarvest(null)
      setShowAddForm(false)
    } else {
      const fullHarvest: Harvest = {
        ...newHarvest as Harvest,
        id: `h-${Date.now()}`,
        farmerId: user?.id ?? 'unknown',
        lat: 8.2917,
        lng: 124.9667,
      }
      setHarvests([fullHarvest, ...harvests])
      setShowAddForm(false)
    }
  }

  const handleEditHarvest = (harvest: Harvest) => {
    setEditingHarvest(harvest)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('agrilink_user')
    localStorage.removeItem('agrilink_auth')
    setUser(null)
    setProfile(null)
    window.location.href = '/'
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.full_name || 'Farmer'
  const userLocation = profile?.location || profile?.province || user?.user_metadata?.location || 'Bukidnon'

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <Sprout className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F2]">
      <Navbar user={user} />

      <div className="space-y-10 p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#4D7C0F] uppercase tracking-widest">Farmer Portal</p>
            <h1 className="text-4xl font-black text-[#1A2E05]">My Harvest Portal</h1>
            <p className="text-[#5B6D44]">Welcome back, {displayName}</p>
            <p className="text-[#5B6D44] text-sm">📍 Region: {userLocation}, Philippines</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <button
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false)
                  setEditingHarvest(null)
                } else {
                  setShowAddForm(true)
                }
              }}
              className={cn(
                "px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95",
                showAddForm
                  ? "bg-[#1A2E05] text-white"
                  : "bg-[#4D7C0F] text-white hover:bg-[#3F6212] shadow-[#4D7C0F]/20"
              )}
            >
              {showAddForm ? (
                <><X className="w-5 h-5" /> Cancel</>
              ) : (
                <><Plus className="w-5 h-5" /> New Harvest</>
              )}
            </button>
          </div>
        </header>

        {/* ✅ AI Recommendation Button — only shows when user has harvests */}
        {!showAddForm && harvests.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={fetchRecommendations}
              disabled={loadingAI}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#4D7C0F] to-[#7CB342] text-white rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {loadingAI ? 'Getting AI Recommendation...' : 'Get AI Recommendation'}
            </button>
          </div>
        )}

        {/* AI Recommendation Banner */}
        {aiRecommendation && !showAddForm && (
          <div className="bg-gradient-to-r from-[#4D7C0F] to-[#7CB342] rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Smart Recommendation</h3>
                <p className="text-white/90 text-sm mb-3">{aiRecommendation.message}</p>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Suggested Price</p>
                    <p className="font-bold">₱{aiRecommendation.suggestedPrice}/kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Potential Buyers</p>
                    <p className="font-bold">~{aiRecommendation.suggestedBuyers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Best Time to List</p>
                    <p className="font-bold text-xs">{aiRecommendation.optimalListingDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Harvest Form */}
        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div
              key={editingHarvest ? editingHarvest.id : 'add-form'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[40px] border-2 border-[#4D7C0F]/10 p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              <HarvestForm
                onSuccess={handleAddHarvest}
                initialData={editingHarvest || undefined}
                isEdit={!!editingHarvest}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Harvests List */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-[#E5EAD7] pb-4">
            <h2 className="text-2xl font-black text-[#1A2E05]">My Active Harvests</h2>
            <div className="flex items-center bg-[#F1F4E8] p-1 rounded-xl">
              <button
                onClick={() => setViewState('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewState === 'grid' ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewState('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewState === 'list' ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {harvests.length > 0 ? (
            <div
              className={cn(
                "grid gap-6",
                viewState === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}
            >
              {harvests.map((harvest) => (
                <HarvestCard
                  key={harvest.id}
                  harvest={harvest}
                  user={user}
                  variant={viewState}
                  onDelete={handleDeleteHarvest}
                  onEdit={handleEditHarvest}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-white border-2 border-dashed border-[#E5EAD7] rounded-3xl">
              <div className="w-20 h-20 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
                <Sprout className="w-10 h-10 text-[#4D7C0F]/40" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#1A2E05] text-lg">No active listings yet</p>
                <p className="text-sm text-[#5B6D44]">Click "New Harvest" to start listing your crops.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}