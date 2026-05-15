import { useState, useEffect, useRef } from 'react'
import type { Harvest } from '../types'
import HarvestCard from '../components/HarvestCard'
import HarvestForm from '../components/HarvestForm'
import { Plus, LayoutGrid, List, Sprout, Sparkles, X, LogOut, Menu, Bell, User as UserIcon, Users, History, Search, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { getSmartListingRecommendations } from '../lib/gemini'

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'My Harvest Dashboard',
  history: 'History Dashboard',
  buyers: 'Interested Buyers',
  account: 'My Account',
}

// ── INTERESTED BUYERS VIEW ──
const InterestedBuyersView = ({ farmerId }: { farmerId: string }) => {
  const [filter, setFilter] = useState<'new' | 'completed' | 'confirmed' | 'all'>('new')
  const [buyers, setBuyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
      if (!error && data) {
        const seen = new Set()
        const unique = (data || []).filter((item: any) => {
          const key = `${item.buyer_name}-${item.crop_type}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setBuyers(unique)
      }
      setLoading(false)
    }
    if (farmerId) fetchBuyers()
  }, [farmerId])

  const markCompleted = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'completed' })
      .eq('id', id)
    if (!error) {
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b))
    }
  }

  const handleConfirmOrder = async (buyer: any) => {
    setConfirming(buyer.id)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'confirmed' })
        .eq('id', buyer.id)
      if (!error) {
        setBuyers(prev => prev.map(b => b.id === buyer.id ? { ...b, status: 'confirmed' } : b))
      }
    } catch (err) {
      console.error('Confirm order error:', err)
    } finally {
      setConfirming(null)
    }
  }

  const filtered = buyers.filter(b => filter === 'all' ? true : b.status === filter)

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#E5EAD7] pb-4">
        <h2 className="text-2xl font-black text-[#1A2E05]">Interested Buyers ({filtered.length})</h2>
        <div className="flex items-center bg-[#F1F4E8] p-1 rounded-xl">
          {(['new', 'confirmed', 'completed', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "p-2 px-4 rounded-lg font-bold text-sm capitalize transition-all",
                filter === tab ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-[#4D7C0F] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(buyer => (
            <div key={buyer.id} className="group bg-white rounded-[32px] border border-[#E5EAD7] p-6 hover:shadow-xl transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="font-black text-xl text-[#1A2E05]">{buyer.buyer_name}</span>
                <span className={cn(
                  "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest",
                  buyer.status === 'new' ? "bg-[#ECFCCB] text-[#4D7C0F]" :
                  buyer.status === 'confirmed' ? "bg-blue-100 text-blue-600" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {buyer.status}
                </span>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-[#5B6D44]"><strong>Product:</strong> {buyer.crop_type} — {buyer.quantity} {buyer.unit}</p>
                <p className="text-sm text-[#5B6D44]"><strong>Date:</strong> {new Date(buyer.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                {buyer.buyer_phone && (
               <p className="text-sm text-[#5B6D44]"><strong>Phone:</strong> {buyer.buyer_phone}</p>
               )}
              </div>
              {buyer.status === 'new' && (
                <div className="pt-4 mt-4 border-t border-[#F1F4E8] space-y-2">
                  <button
                    onClick={() => handleConfirmOrder(buyer)}
                    disabled={confirming === buyer.id}
                    className="w-full py-3 bg-[#4D7C0F] text-white text-sm font-bold rounded-2xl hover:bg-[#3F6212] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {confirming === buyer.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirm Order
                  </button>
                  <button
                    onClick={() => markCompleted(buyer.id)}
                    className="w-full py-2.5 bg-white border border-[#4D7C0F] text-[#4D7C0F] text-sm font-bold rounded-2xl hover:bg-[#F1F4E8] transition-colors"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-white border-2 border-dashed border-[#E5EAD7] rounded-3xl">
          <div className="w-20 h-20 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-[#4D7C0F]/40" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-[#1A2E05] text-lg">No buyers found</p>
            <p className="text-sm text-[#5B6D44]">You have no buyers in this category.</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default function FarmerDashboard() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)

  // Navigation & UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState<'dashboard' | 'history' | 'buyers' | 'account'>('dashboard')
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Account Editing States
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [accountForm, setAccountForm] = useState({
    name: '',
    location: '',
    phone: ''
  })

  // ── Notifications State ──
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.is_read).length)
      }
    }

    fetchNotifications()

    const channel = supabase
      .channel('farmer-notifications-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `farmer_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const markNotificationsRead = async () => {
    setShowNotificationMenu(prev => !prev)
    if (unreadCount === 0) return
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('farmer_id', user.id)
      .eq('is_read', false)
  }

  // ── Harvests & History from Supabase ──
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [historyHarvests, setHistoryHarvests] = useState<Harvest[]>([])
  const [loadingHarvests, setLoadingHarvests] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null)
  const [viewState, setViewState] = useState<'grid' | 'list'>('grid')
  const [aiRecommendation, setAiRecommendation] = useState<any>(null)
  const [historySearch, setHistorySearch] = useState('')

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

  useEffect(() => {
    if (profile || user) {
      setAccountForm({
        name: profile?.full_name || user?.user_metadata?.full_name || 'Farmer',
        location: profile?.location || profile?.province || user?.user_metadata?.location || 'Bukidnon',
        phone: profile?.phone || user?.phone || ''
      })
    }
  }, [profile, user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchHarvests = async (userId: string) => {
    setLoadingHarvests(true)
    const { data, error } = await supabase
      .from('harvests')
      .select('*')
      .eq('farmer_id', userId)
      .neq('status', 'sold')
      .order('created_at', { ascending: false })
    if (!error && data) setHarvests(data as Harvest[])
    setLoadingHarvests(false)
  }

  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('harvests')
      .select('*')
      .eq('farmer_id', userId)
      .eq('status', 'sold')
      .order('created_at', { ascending: false })
    if (!error && data) setHistoryHarvests(data as Harvest[])
  }

  useEffect(() => {
    if (user?.id) {
      fetchHarvests(user.id)
      fetchHistory(user.id)
    }
  }, [user])

  const handleAddHarvest = async (newHarvest: any) => {
    if (!user?.id) return

    let image_url = null
    if (newHarvest.image instanceof File) {
      const file = newHarvest.image
      const ext = file.name.split('.').pop()
      const path = `harvests/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('harvest-images')
        .upload(path, file, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('harvest-images')
          .getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    }

    if (editingHarvest) {
      const { data, error } = await supabase
        .from('harvests')
        .update({
          crop_type: newHarvest.crop_type,
          category: newHarvest.category,
          quantity: newHarvest.quantity,
          unit: newHarvest.unit,
          harvest_date: newHarvest.harvest_date,
          province: newHarvest.province,
          municipality: newHarvest.municipality,
          barangay: newHarvest.barangay,
          price_per_unit: newHarvest.price_per_unit,
          description: newHarvest.description,
          status: newHarvest.status,
          ...(image_url && { image_url }),
        })
        .eq('id', editingHarvest.id)
        .select()
        .single()
      if (!error && data) {
        setHarvests(prev => prev.map(h => h.id === editingHarvest.id ? data as Harvest : h))
      }
      setEditingHarvest(null)
      setShowAddForm(false)

    } else {
      const insertData = {
        farmer_id: user.id,
        crop_type: newHarvest.crop_type,
        category: newHarvest.category,
        quantity: newHarvest.quantity,
        unit: newHarvest.unit,
        harvest_date: newHarvest.harvest_date,
        province: newHarvest.province,
        municipality: newHarvest.municipality,
        barangay: newHarvest.barangay,
        price_per_unit: newHarvest.price_per_unit || 0,
        description: newHarvest.description || '',
        status: newHarvest.status || 'active',
        image_url: image_url,
        lat: 8.2917,
        lng: 124.9667,
      }

      const { error } = await supabase
        .from('harvests')
        .insert([insertData])

      if (error) {
        console.error('Insert failed:', error.message, error.code, error.hint)
        alert('Failed to add harvest: ' + error.message)
      } else {
        await fetchHarvests(user.id)
      }
      setShowAddForm(false)
    }
  }

  const handleDeleteHarvest = async (id: string) => {
    const { error } = await supabase
      .from('harvests')
      .delete()
      .eq('id', id)
    if (!error) {
      setHarvests(prev => prev.filter(h => h.id !== id))
    }
  }

  const handleSoldOut = async (id: string) => {
    const { data, error } = await supabase
      .from('harvests')
      .update({ status: 'sold' })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setHistoryHarvests(prev => [data as Harvest, ...prev])
      setHarvests(prev => prev.filter(h => h.id !== id))
    }
  }

  const handleEditHarvest = (harvest: Harvest) => {
    setEditingHarvest(harvest)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveAccount = async () => {
    const updatedProfile = {
      ...profile,
      full_name: accountForm.name,
      location: accountForm.location,
      phone: accountForm.phone
    }
    setProfile(updatedProfile)
    
    // 1. Update internal auth metadata
    await supabase.auth.updateUser({ data: updatedProfile })
    
    // 2. IMPORTANT: Update the public profiles table so buyers can pull this data!
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ 
          full_name: accountForm.name, 
          location: accountForm.location, 
          phone: accountForm.phone 
        })
        .eq('id', user.id)
    }

    const demoUserStr = localStorage.getItem('agrilink_user')
    if (demoUserStr) {
      const demoUser = JSON.parse(demoUserStr)
      demoUser.user_metadata = updatedProfile
      localStorage.setItem('agrilink_user', JSON.stringify(demoUser))
    }
    
    setIsEditingAccount(false)
    setAccountMessage('Changes saved successfully!')
    setTimeout(() => setAccountMessage(''), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('agrilink_user')
    localStorage.removeItem('agrilink_auth')
    setUser(null)
    setProfile(null)
    window.location.href = '/'
  }

  const fetchRecommendations = async () => {
    if (harvests.length === 0 || !profile) return
    setLoadingAI(true)
    setAiRecommendation(null)
    const latestHarvest = harvests[0]
    const provinceName = latestHarvest.province || profile.location || 'Bukidnon'
    const cropTypeName = latestHarvest.crop_type || 'crop'
    const rec = await getSmartListingRecommendations(
      cropTypeName,
      provinceName,
      latestHarvest.harvest_date || new Date().toISOString().split('T')[0]
    )
    setAiRecommendation(rec)
    setLoadingAI(false)
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.full_name || 'Farmer'
  const userLocation = profile?.location || profile?.province || user?.user_metadata?.location || 'Bukidnon'

  const filteredHistory = historyHarvests.filter(h =>
    !historySearch ||
    h.crop_type?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.province?.toLowerCase().includes(historySearch.toLowerCase())
  )

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

      {/* ── FLOATING AI CHATBOX ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 bg-white rounded-2xl shadow-2xl border border-[#E5EAD7] overflow-hidden flex flex-col"
            >
              <div className="bg-[#4D7C0F] px-4 py-3 flex justify-between items-center text-white">
                <span className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Assistant</span>
                <button onClick={() => setIsAIChatOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 bg-gray-50 flex-1 max-h-96 overflow-y-auto">
                {aiRecommendation ? (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5EAD7] text-sm text-[#5B6D44]">
                    <p className="font-bold text-[#1A2E05] mb-3 leading-relaxed">{aiRecommendation.message}</p>
                    <div className="space-y-2">
                      <p className="flex justify-between border-b border-gray-100 pb-1"><strong>Suggested Price:</strong> <span>₱{aiRecommendation.suggestedPrice}/kg</span></p>
                      <p className="flex justify-between border-b border-gray-100 pb-1"><strong>Potential Buyers:</strong> <span>~{aiRecommendation.suggestedBuyers}</span></p>
                      <p className="flex justify-between pb-1"><strong>Best Time to List:</strong> <span className="text-right ml-2">{aiRecommendation.optimalListingDate}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-[#4D7C0F]" />
                    </div>
                    <p className="text-sm text-[#5B6D44] mb-4">Need help pricing or timing your harvest?</p>
                    <button
                      onClick={fetchRecommendations}
                      disabled={loadingAI || harvests.length === 0}
                      className="w-full py-3 bg-[#4D7C0F] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#3F6212] transition-colors disabled:opacity-50"
                    >
                      {loadingAI ? 'Thinking...' : 'Get Recommendation'}
                    </button>
                    {harvests.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">Add a harvest first to get recommendations.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          className="w-14 h-14 bg-gradient-to-r from-[#4D7C0F] to-[#7CB342] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform"
        >
          {isAIChatOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </button>
      </div>

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#E5EAD7] sticky top-0 z-40 shadow-sm w-full">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-[#1A2E05]" />
            </button>
            <button 
              onClick={() => setActiveView('dashboard')} 
              className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
            >
              <div className="bg-[#4D7C0F] p-1.5 rounded-lg">
                <Sprout className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-[#1A2E05] text-xl">AgriLink</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mr-13">
            {/* ── Notifications Bell ── */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={markNotificationsRead}
                className="p-2 relative hover:bg-gray-100 rounded-lg text-[#5B6D44] transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotificationMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-[#E5EAD7] shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="bg-gray-50 border-b border-[#E5EAD7] px-4 py-3 flex justify-between items-center">
                      <h4 className="font-bold text-[#1A2E05] text-sm">Notifications ({notifications.length})</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markNotificationsRead() }}
                          className="text-xs font-bold text-[#4D7C0F] hover:underline"
                        >
                          Read all
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setActiveView('buyers');
                            setShowNotificationMenu(false);
                          }}
                          className={cn(
                            "p-4 transition-colors cursor-pointer flex gap-3 items-start border-b border-gray-50 last:border-0",
                            !n.is_read ? "bg-white hover:bg-gray-50" : "bg-gray-50 opacity-70"
                          )}
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Users className="w-4 h-4 text-green-700" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[#1A2E05] text-sm font-bold">{n.buyer_name}</p>
                            <p className="text-[#5B6D44] text-sm leading-snug">
                              is interested in your {n.quantity} {n.unit} of {n.crop_type}.
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 text-center text-sm text-gray-500">No notifications yet.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setActiveView('account')}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-[#4D7C0F] text-white rounded-full flex items-center justify-center font-bold shadow-md">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-[#1A2E05] hidden sm:block">{displayName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── SIDE DRAWER ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#E5EAD7]">
                <div className="flex items-center gap-2">
                  <div className="bg-[#4D7C0F] p-1.5 rounded-lg"><Sprout className="text-white w-6 h-6" /></div>
                  <span className="text-xl font-black text-[#1A2E05]">AgriLink</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto">
                {[
                  { view: 'dashboard', icon: <Sprout className="w-5 h-5" />, label: 'Harvest Dashboard' },
                  { view: 'buyers', icon: <Users className="w-5 h-5" />, label: 'Interested Buyers' },
                  { view: 'history', icon: <History className="w-5 h-5" />, label: 'History Dashboard' },
                ].map(({ view, icon, label }) => (
                  <button
                    key={view}
                    onClick={() => { setActiveView(view as any); setIsSidebarOpen(false) }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all",
                      activeView === view ? "bg-[#F1F4E8] text-[#4D7C0F] shadow-sm" : "text-[#5B6D44] hover:bg-gray-50"
                    )}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-[#E5EAD7]">
                <button
                  onClick={() => { setActiveView('account'); setIsSidebarOpen(false) }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold w-full transition-all",
                    activeView === 'account' ? "bg-[#F1F4E8] text-[#4D7C0F] shadow-sm" : "text-[#5B6D44 hover:bg-gray-50"
                  )}
                >
                  <UserIcon className="w-5 h-5" /> Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL: Add / Edit Harvest ── */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowAddForm(false); setEditingHarvest(null) }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-[32px] border border-[#E5EAD7] p-6 md:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-black text-[#1A2E05]">
                    {editingHarvest ? 'Edit Harvest' : 'Add New Harvest'}
                  </h3>
                  <button
                    onClick={() => { setShowAddForm(false); setEditingHarvest(null) }}
                    className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
                <HarvestForm
                  onSuccess={handleAddHarvest}
                  initialData={editingHarvest || undefined}
                  isEdit={!!editingHarvest}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10">

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {/* Hero Banner */}
            <div className="bg-[#4D7C0F] rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <Sprout className="w-64 h-64" />
              </div>
              <div className="space-y-2 relative z-10">
                <p className="text-xs font-bold text-[#ECFCCB] uppercase tracking-widest mb-1">Marketplace</p>
                <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3">
                  Welcome back!
                </h1>
                <p className="text-white/80 text-lg font-medium">Region: {userLocation}, Philippines</p>
              </div>
            </div>

            {/* Harvests List */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-[#E5EAD7] pb-4">
                <h2 className="text-2xl font-black text-[#1A2E05]">My Active Harvests ({harvests.length})</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (showAddForm) { setShowAddForm(false); setEditingHarvest(null) }
                      else setShowAddForm(true)
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-sm",
                      showAddForm
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white text-[#4D7C0F] border border-[#4D7C0F] hover:bg-[#F1F4E8]"
                    )}
                  >
                    {showAddForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Harvest</>}
                  </button>
                  <div className="flex items-center bg-[#F1F4E8] p-1 rounded-xl">
                    <button
                      onClick={() => setViewState('grid')}
                      className={cn("p-2 rounded-lg transition-all", viewState === 'grid' ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewState('list')}
                      className={cn("p-2 rounded-lg transition-all", viewState === 'list' ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]")}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {loadingHarvests ? (
                <div className="py-20 flex justify-center">
                  <div className="w-10 h-10 border-4 border-[#4D7C0F] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : harvests.length > 0 ? (
                <div className={cn("grid gap-6", viewState === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                  {harvests.map((harvest) => (
                    <HarvestCard
                      key={harvest.id}
                      harvest={harvest}
                      user={user}
                      variant={viewState}
                      onSoldOut={handleSoldOut}
                      onEdit={handleEditHarvest}
                      onDelete={handleDeleteHarvest}
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
          </>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <section className="relative space-y-8 bg-white/40 p-8 rounded-[40px] border border-[#E5EAD7] overflow-hidden min-h-[60vh]">
            <div className="absolute top-0 left-0 opacity-5 pointer-events-none transform -translate-x-1/3 -translate-y-1/3">
              <Sprout className="w-96 h-96 text-[#4D7C0F]" />
            </div>
            <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <Sprout className="w-[30rem] h-[30rem] text-[#4D7C0F]" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="relative w-full max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5EAD7] rounded-2xl focus:ring-2 focus:ring-[#4D7C0F] outline-none text-[#1A2E05] font-medium shadow-sm"
                />
              </div>

              {filteredHistory.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredHistory.map(harvest => (
                    <HarvestCard key={harvest.id} harvest={harvest} user={user} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
                    <History className="w-10 h-10 text-[#4D7C0F]/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[#1A2E05] text-lg">No history available</p>
                    <p className="text-sm text-[#5B6D44]">Products you mark as 'Sold Out' will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Buyers View */}
        {activeView === 'buyers' && (
          <InterestedBuyersView farmerId={user?.id ?? ''} />
        )}

        {/* Account View */}
        {activeView === 'account' && (
          <div className="bg-white rounded-[32px] shadow-xl border border-[#E5EAD7] max-w-2xl mx-auto overflow-hidden">
            <div className="bg-[#4D7C0F] p-8 text-white flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <UserIcon className="w-48 h-48" />
              </div>
              <div className="w-16 h-16 bg-white text-[#4D7C0F] rounded-full flex items-center justify-center font-bold text-2xl shadow-md relative z-10">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black">{displayName}</h2>
                <p className="text-white/80">Farmer Account</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-[#F7F9F2] p-6 rounded-2xl border border-[#E5EAD7]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1A2E05] text-lg">Personal Information</h3>
                  {!isEditingAccount && (
                    <button onClick={() => setIsEditingAccount(true)} className="text-sm font-bold text-[#4D7C0F] hover:underline">Edit</button>
                  )}
                </div>

                {accountMessage && (
                  <p className="text-green-600 text-sm font-bold mb-4 bg-green-50 p-2 rounded-lg text-center">{accountMessage}</p>
                )}

                {isEditingAccount ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', key: 'name', type: 'text' },
                      { label: 'Location', key: 'location', type: 'text' },
                      { label: 'Phone Number', key: 'phone', type: 'text' },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-[#5B6D44] uppercase mb-1">{label}</label>
                        <input
                          type={type}
                          value={(accountForm as any)[key]}
                          onChange={(e) => setAccountForm({ ...accountForm, [key]: e.target.value })}
                          className="w-full p-3 bg-white rounded-xl border border-[#E5EAD7] outline-none focus:ring-2 focus:ring-[#4D7C0F]"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveAccount} className="flex-1 py-3 bg-[#4D7C0F] text-white rounded-xl font-bold hover:bg-[#3F6212] transition-colors text-sm shadow-md">
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setAccountForm({
                            name: profile?.full_name || user?.user_metadata?.full_name || 'Farmer',
                            location: profile?.location || profile?.province || user?.user_metadata?.location || 'Bukidnon',
                            phone: profile?.phone || user?.phone || ''
                          })
                          setIsEditingAccount(false)
                        }}
                        className="flex-1 py-3 bg-white text-[#5B6D44] border border-[#E5EAD7] rounded-xl font-bold hover:bg-[#F1F4E8] transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[#5B6D44]"><strong className="text-[#1A2E05]">Name:</strong> {displayName}</p>
                    <p className="text-[#5B6D44]"><strong className="text-[#1A2E05]">Location:</strong> {userLocation}</p>
                    <p className="text-[#5B6D44]"><strong className="text-[#1A2E05]">Phone:</strong> {accountForm.phone || 'Not provided'}</p>
                    <p className="text-[#5B6D44]"><strong className="text-[#1A2E05]">Role:</strong> Farmer</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-2xl font-bold flex items-center justify-center w-full gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}