import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sprout, Sparkles, X, LogOut, Menu, User as UserIcon, 
  MapPin, Calendar, Store, Map as MapIcon, Search, Image as ImageIcon, CheckCircle, ChevronDown, Navigation, Filter, Bell, History
} from 'lucide-react'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── LEAFLET SETUP ──
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

L.Marker.prototype.options.icon = DefaultIcon

// Restrict map strictly to Mindanao
const MINDANAO_BOUNDS = L.latLngBounds(
  L.latLng(4.8, 119.0), // Southwest corner
  L.latLng(10.6, 126.8) // Northeast corner
)

const MINDANAO_PROVINCES = [
  "Agusan del Norte", "Agusan del Sur", "Basilan", "Bukidnon", "Camiguin",
  "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental",
  "Davao Oriental", "Dinagat Islands", "Lanao del Norte", "Lanao del Sur",
  "Maguindanao del Norte", "Maguindanao del Sur", "Misamis Occidental", "Misamis Oriental",
  "Sarangani", "South Cotabato", "Sultan Kudarat", "Sulu", "Surigao del Norte",
  "Surigao del Sur", "Tawi-Tawi", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"
].sort();

// Mock available harvests from farmers
const AVAILABLE_HARVESTS = [
  {
    id: 'h-1',
    category: 'Grains & Rice',
    crop: 'Yellow Corn',
    farmer: 'Juan Dela Cruz',
    contact: '0912 345 6789',
    qty: '50 Sacks (Kaban)',
    date: '5/20/2026',
    province: 'Sumilao, Bukidnon',
    status: 'Available',
    price: '₱1200',
    imageUrl: null
  },
  {
    id: 'h-2',
    category: 'Grains & Rice',
    crop: 'Palay (Rice)',
    farmer: 'Pedro Santos',
    contact: '0998 765 4321',
    qty: '120 Sacks (Kaban)',
    date: '5/25/2026',
    province: 'Binalonan, Pangasinan',
    status: 'Pending',
    price: '₱1100',
    imageUrl: null
  },
  {
    id: 'h-3',
    category: 'Vegetables',
    crop: 'Red Onions',
    farmer: 'Maria Cruz',
    contact: '0915 123 4567',
    qty: '2 Metric Tons',
    date: '5/15/2026',
    province: 'Bongabon, Nueva Ecija',
    status: 'Available',
    price: '₱45000',
    imageUrl: null
  },
  {
    id: 'h-4',
    category: 'Vegetables',
    crop: 'Tomatoes',
    farmer: 'Roberto Reyes',
    contact: '0922 888 9999',
    qty: '800 kg',
    date: '5/18/2026',
    province: 'Tupi, South Cotabato',
    status: 'Available',
    price: '₱45',
    imageUrl: null
  },
]

export default function BuyerDashboard() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Navigation & UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState<'marketplace' | 'map' | 'order_history' | 'account'>('marketplace')
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  // Custom Dropdown State for ensuring downwards opening
  const [openDropdown, setOpenDropdown] = useState<'category' | 'region' | 'mapFilter' | null>(null)

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Account Editing States
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [accountForm, setAccountForm] = useState({
    name: '',
    location: '',
    phone: ''
  })

  // Harvests from Supabase
  const [harvests, setHarvests] = useState<any[]>([])
  const [orderHistory, setOrderHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchHarvests = async () => {
      const { data, error } = await supabase
        .from('harvests')
        // Updated query to also fetch the farmer's phone number
        .select('*, profiles:farmer_id(full_name, phone)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setHarvests(data)
      }
    }
    fetchHarvests()
  }, [])

  // Marketplace States
  const [searchQuery, setSearchQuery] = useState('')
  const [marketCategory, setMarketCategory] = useState('All Categories')
  const [marketRegion, setMarketRegion] = useState('All Regions')
  const [interestedIds, setInterestedIds] = useState<string[]>([])

  // Fetch interests and notifications for this buyer
  useEffect(() => {
    if (!user) return
    const fetchInterests = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('harvest_id')
        .eq('buyer_id', user.id)
      if (!error && data) {
        setInterestedIds(data.map((n: any) => n.harvest_id))
      }
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('buyer_notifications')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.is_read).length)
      }
    }

    fetchInterests()
    fetchNotifications()

    // Real-time listener for new order confirmations
    const channel = supabase
      .channel('buyer-notifications-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'buyer_notifications',
        filter: `buyer_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Fetch Order History when view changes
  useEffect(() => {
    if (user && activeView === 'order_history') {
      const fetchOrders = async () => {
        const { data } = await supabase
          .from('buyer_notifications')
          .select('*')
          .eq('buyer_id', user.id)
          .eq('type', 'order_confirmed')
          .order('created_at', { ascending: false })
        if (data) setOrderHistory(data)
      }
      fetchOrders()
    }
  }, [user, activeView])

  const markNotificationsRead = async () => {
    setShowNotificationMenu(prev => !prev)
    if (unreadCount === 0) return
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('buyer_notifications')
      .update({ is_read: true })
      .eq('buyer_id', user.id)
      .eq('is_read', false)
  }

  // Harvest Map Filter States
  const [mapFilter, setMapFilter] = useState('All')
  const mapCategories = ["All", "Vegetables", "Fruits", "Grains & Rice", "Root Crops", "Spices", "Poultry & Eggs"]
  
  const filteredMapHarvests = harvests.filter(h => 
    mapFilter === 'All' || h.category === mapFilter
  )

  // AI Chat State
  const [aiMessage, setAiMessage] = useState('')
  const [chatLog, setChatLog] = useState([
    {
      role: 'ai',
      text: 'Kumusta! Ako si Ani. Bilang buyer, matutulungan kita mahanap ng pinakamababang presyo ng mga pananim. Anong gulay o prutas ang hinahanap mo ngayon?',
    },
  ])

  // Handle clicking outside custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.custom-dropdown')) {
        setOpenDropdown(null)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotificationMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Update Account Form state when profile loads
  useEffect(() => {
    if (profile || user) {
      setAccountForm({
        name: profile?.full_name || user?.user_metadata?.full_name || user?.full_name || 'Buyer',
        location: profile?.location || profile?.province || user?.user_metadata?.location || 'Philippines',
        phone: profile?.phone || user?.phone || ''
      })
    }
  }, [profile, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('agrilink_user')
    localStorage.removeItem('agrilink_auth')
    setUser(null)
    setProfile(null)
    window.location.href = '/'
  }

  const handleSaveAccount = () => {
    const updatedProfile = { ...profile, full_name: accountForm.name, location: accountForm.location, phone: accountForm.phone }
    setProfile(updatedProfile)
    
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

  // Updated handleExpressInterest function - only sends once per harvest
  const handleExpressInterest = async (harvest: any) => {
    const id = harvest.id
    const alreadyInterested = interestedIds.includes(id)
    
    if (alreadyInterested) return // Do nothing if already sent

    // Optimistically update UI
    setInterestedIds(prev => [...prev, id])

    const buyerName = profile?.full_name || user?.user_metadata?.full_name || user?.full_name || 'A buyer'
    const buyerId = user?.id || null

    const { error } = await supabase
      .from('notifications')
      .insert({
        farmer_id: harvest.farmer_id,
        buyer_id: buyerId,
        harvest_id: harvest.id,
        buyer_name: buyerName,
        crop_type: harvest.crop_type,
        quantity: String(harvest.quantity),
        unit: harvest.unit,
        is_read: false
      })

    // Also record into buyer_interests for the farmer's Interested Buyers dashboard
    await supabase
      .from('buyer_interests')
      .insert({
        farmer_id: harvest.farmer_id,
        buyer_id: buyerId,
        harvest_id: harvest.id,
        contact_number: profile?.phone || user?.phone || 'Not provided',
        product: `${harvest.quantity} ${harvest.unit} of ${harvest.crop_type}`,
        location: profile?.location || profile?.province || 'Philippines',
        status: 'new'
      })

    if (error) {
      console.error('Failed to send notification:', error)
      // Revert UI if insert failed
      setInterestedIds(prev => prev.filter(i => i !== id))
    }
  }

  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiMessage.trim()) return
    const newLog = [...chatLog, { role: 'user', text: aiMessage }]
    setChatLog(newLog)
    setAiMessage('')
    setTimeout(() => {
      setChatLog([
        ...newLog,
        {
          role: 'ai',
          text: 'May nakita akong available na harvest sa Bukidnon na angkop sa iyong hinihanap. Gusto mo bang i-connect kita sa farmer?',
        },
      ])
    }, 1000)
  }

  const filteredHarvests = harvests.length > 0 ? harvests.filter(h => {
    const cropType = h.crop_type || ''
    const province = h.province || ''
    const farmerName = h.profiles?.full_name || ''

    const matchSearch = cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        province.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        farmerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchCategory = marketCategory === 'All Categories' || h.category === marketCategory
    const matchRegion = marketRegion === 'All Regions' || province.includes(marketRegion)

    return matchSearch && matchCategory && matchRegion
  }) : AVAILABLE_HARVESTS.filter(h => {
    // Fallback search logic for mock data if DB is empty
    const matchSearch = h.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        h.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        h.farmer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = marketCategory === 'All Categories' || h.category === marketCategory
    const matchRegion = marketRegion === 'All Regions' || h.province.includes(marketRegion)
    return matchSearch && matchCategory && matchRegion
  })

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.full_name || 'Buyer'
  const userLocation = profile?.location || profile?.province || user?.user_metadata?.location || 'Philippines'

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
                <span className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Ani Assistant</span>
                <button onClick={() => setIsAIChatOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 bg-gray-50 flex-1 h-80 overflow-y-auto space-y-3">
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-[#4D7C0F] text-white rounded-br-none'
                          : 'bg-white border border-[#E5EAD7] text-[#1A2E05] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white border-t border-[#E5EAD7]">
                <form onSubmit={handleSendAi} className="flex gap-2">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={e => setAiMessage(e.target.value)}
                    placeholder="Ask about crops..."
                    className="flex-1 border border-[#E5EAD7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] bg-[#F7F9F2]"
                  />
                  <button
                    type="submit"
                    disabled={!aiMessage.trim()}
                    className="bg-[#4D7C0F] text-white px-3 rounded-xl hover:bg-[#3F6212] transition-colors disabled:opacity-50 font-bold text-sm"
                  >
                    Send
                  </button>
                </form>
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

      {/* ── ALIGNED HEADER WITH CLICKABLE PRIMARY BRAND ELEMENT ── */}
      <header className="bg-white border-b border-[#E5EAD7] sticky top-0 z-40 shadow-sm w-full">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-[#1A2E05]" />
            </button>
            <button 
              onClick={() => setActiveView('marketplace')}
              className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
            >
              <div className="bg-[#4D7C0F] p-1.5 rounded-lg">
                <Sprout className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-[#1A2E05] text-xl">AgriLink</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mr-8">
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
                            setActiveView('order_history');
                            setShowNotificationMenu(false);
                          }}
                          className={cn(
                            "p-4 transition-colors cursor-pointer flex gap-3 items-start border-b border-gray-50 last:border-0",
                            !n.is_read ? "bg-white hover:bg-gray-50" : "bg-gray-50 opacity-70"
                          )}
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle className="w-4 h-4 text-green-700" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[#1A2E05] text-sm font-bold">{n.farmer_name || 'A Farmer'}</p>
                            <p className="text-[#5B6D44] text-sm leading-snug">
                              has confirmed your order for {n.product}.
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

      {/* ── COLLAPSIBLE SIDE DRAWER ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-[100] flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#E5EAD7]">
                <div className="flex items-center gap-2">
                  <div className="bg-[#4D7C0F] p-1.5 rounded-lg">
                    <Sprout className="text-white w-6 h-6" />
                  </div>
                  <span className="text-xl font-black text-[#1A2E05]">AgriLink</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto">
                <button
                  onClick={() => { setActiveView('marketplace'); setIsSidebarOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all",
                    activeView === 'marketplace' ? "bg-[#F1F4E8] text-[#4D7C0F] shadow-sm" : "text-[#5B6D44] hover:bg-gray-50"
                  )}
                >
                  <Store className="w-5 h-5" /> Marketplace
                </button>
                <button
                  onClick={() => { setActiveView('map'); setIsSidebarOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all",
                    activeView === 'map' ? "bg-[#F1F4E8] text-[#4D7C0F] shadow-sm" : "text-[#5B6D44] hover:bg-gray-50"
                  )}
                >
                  <MapIcon className="w-5 h-5" /> Harvest Map
                </button>
                <button
                  onClick={() => { setActiveView('order_history'); setIsSidebarOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all",
                    activeView === 'order_history' ? "bg-[#F1F4E8] text-[#4D7C0F] shadow-sm" : "text-[#5B6D44] hover:bg-gray-50"
                  )}
                >
                  <History className="w-5 h-5" /> Order History
                </button>
              </div>

              <div className="p-4 border-t border-[#E5EAD7]">
                <button
                  onClick={() => { setActiveView('account'); setIsSidebarOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold w-full transition-all",
                    activeView === 'account' ? "bg-[#F1F4E8] text-[#4D7C0F] shadow-sm" : "text-[#5B6D44] hover:bg-gray-50"
                  )}
                >
                  <UserIcon className="w-5 h-5" /> Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10">

        {/* Marketplace View */}
        {activeView === 'marketplace' && (
          <section className="space-y-8">
            <div className="bg-[#4D7C0F] rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col justify-center gap-2 mb-8">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <Store className="w-64 h-64" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white relative z-10">Discover Upcoming Harvests</h1>
              <p className="text-white/80 font-medium relative z-10">Connect with verified farmers and secure your supply in advance.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search crops (e.g. Corn, Rice, Onion)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5EAD7] rounded-2xl focus:ring-2 focus:ring-[#4D7C0F] outline-none text-[#1A2E05] font-medium shadow-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative custom-dropdown z-30">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#E5EAD7] rounded-2xl font-bold text-[#1A2E05] shadow-sm hover:bg-gray-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <span className="min-w-[110px] text-left">{marketCategory}</span>
                    <ChevronDown className={cn("w-4 h-4 text-[#5B6D44] transition-transform", openDropdown === 'category' && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'category' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-56 bg-white border border-[#E5EAD7] rounded-2xl shadow-xl overflow-hidden py-2"
                      >
                        {["All Categories", "Vegetables", "Fruits", "Grains & Rice", "Root Crops", "Spices", "Poultry & Eggs"].map(cat => (
                          <button
                            key={cat}
                            onClick={() => { setMarketCategory(cat); setOpenDropdown(null) }}
                            className={cn(
                              "w-full text-left px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#F7F9F2]",
                              marketCategory === cat ? "text-[#4D7C0F] bg-[#ECFCCB]" : "text-[#5B6D44]"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative custom-dropdown z-20">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === 'region' ? null : 'region')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#E5EAD7] rounded-2xl font-bold text-[#1A2E05] shadow-sm hover:bg-gray-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <span className="truncate max-w-[120px] min-w-[90px] text-left">{marketRegion}</span>
                    <ChevronDown className={cn("w-4 h-4 text-[#5B6D44] transition-transform", openDropdown === 'region' && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'region' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] right-0 w-full sm:w-64 bg-white border border-[#E5EAD7] rounded-2xl shadow-xl overflow-y-auto max-h-72 py-2"
                      >
                        <button
                          onClick={() => { setMarketRegion("All Regions"); setOpenDropdown(null) }}
                          className={cn(
                            "w-full text-left px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#F7F9F2]",
                            marketRegion === "All Regions" ? "text-[#4D7C0F] bg-[#ECFCCB]" : "text-[#5B6D44]"
                          )}
                        >
                          All Regions
                        </button>
                        {MINDANAO_PROVINCES.map(prov => (
                          <button
                            key={prov}
                            onClick={() => { setMarketRegion(prov); setOpenDropdown(null) }}
                            className={cn(
                              "w-full text-left px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#F7F9F2]",
                              marketRegion === prov ? "text-[#4D7C0F] bg-[#ECFCCB]" : "text-[#5B6D44]"
                            )}
                          >
                            {prov}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {filteredHarvests.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredHarvests.map(harvest => {
                  const isInterested = interestedIds.includes(harvest.id)
                  const displayDate = harvest.harvest_date
                    ? new Date(harvest.harvest_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                    : harvest.date || 'N/A'
                  return (
                    <div key={harvest.id} className="group bg-white rounded-[32px] border border-[#E5EAD7] p-6 hover:shadow-xl transition-all flex flex-col h-full z-0">
                      <div className="w-full h-40 bg-[#F1F4E8] rounded-2xl mb-5 flex items-center justify-center overflow-hidden shrink-0 border border-[#E5EAD7]">
                        {harvest.image_url ? (
                          <img src={harvest.image_url} alt={harvest.crop_type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-[#4D7C0F]/30" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          harvest.status === 'active' || harvest.status === 'Available' ? "bg-[#ECFCCB] text-[#4D7C0F]" : "bg-yellow-100 text-yellow-800"
                        )}>
                          {harvest.status}
                        </span>
                        <span className="text-[10px] font-black text-[#4D7C0F] uppercase tracking-widest bg-[#ECFCCB] px-3 py-1 rounded-full">
                          {harvest.category}
                        </span>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold text-[#A16207] uppercase tracking-widest">{harvest.crop_type || harvest.crop}</p>
                              <h3 className="text-2xl font-black text-[#1A2E05] leading-none mt-1">{harvest.quantity || harvest.qty} {harvest.unit || ''}</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-[#4D7C0F]">{harvest.price_per_unit ? `₱${harvest.price_per_unit}` : harvest.price}</p>
                            </div>
                          </div>
                        </div>

                        {/* Add Contact Number and Farmer Name block */}
                        <div className="border-t border-[#E5EAD7] pt-3 space-y-1">
                          <p className="text-sm text-[#5B6D44]">
                            Farmer: <strong className="text-[#1A2E05]">{harvest.profiles?.full_name || harvest.farmer || 'Unknown'}</strong>
                          </p>
                          <p className="text-sm text-[#5B6D44]">
                            Contact: <strong className="text-[#1A2E05]">{harvest.profiles?.phone || harvest.contact || 'Not provided'}</strong>
                          </p>
                        </div>

                        {harvest.description && (
                          <div className="p-3 bg-[#F1F4E8] rounded-2xl border border-[#E5EAD7]">
                            <p className="text-[10px] font-bold text-[#4D7C0F] uppercase tracking-wider mb-1">Description</p>
                            <p className="text-xs text-[#5B6D44] leading-relaxed line-clamp-3">
                              {harvest.description}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between gap-4 pb-4">
                          <div className="flex items-start gap-2 text-[#5B6D44] flex-1">
                            <MapPin className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold uppercase text-[#4D7C0F]">Location</span>
                              <span className="text-xs leading-tight">{harvest.barangay ? `${harvest.barangay}, ` : ''}{harvest.province}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-[#5B6D44] shrink-0 text-right">
                            <Calendar className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" />
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] font-bold uppercase text-[#4D7C0F]">Target Date</span>
                              <span className="text-xs leading-tight">{displayDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F1F4E8]">
                        <button
                          onClick={() => handleExpressInterest(harvest)}
                          className={cn(
                            "w-full py-3 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2",
                            isInterested 
                              ? "bg-[#ECFCCB] text-[#4D7C0F] border border-[#4D7C0F]/20 hover:bg-[#D9F99D]" 
                              : "bg-[#4D7C0F] text-white hover:bg-[#3F6212]"
                          )}
                        >
                          {isInterested ? <><CheckCircle className="w-4 h-4" /> Sent</> : 'Interested'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-white border-2 border-dashed border-[#E5EAD7] rounded-3xl">
                <div className="w-20 h-20 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-[#4D7C0F]/40" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[#1A2E05] text-lg">No harvests found</p>
                  <p className="text-sm text-[#5B6D44]">Try adjusting your search or filters.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Order History View */}
        {activeView === 'order_history' && (
          <section className="space-y-8">
            <div className="bg-[#4D7C0F] rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col justify-center gap-2 mb-8">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <History className="w-64 h-64" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white relative z-10">Order History</h1>
              <p className="text-white/80 font-medium relative z-10">Track and review your confirmed harvest orders.</p>
            </div>

            {orderHistory.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {orderHistory.map(order => (
                  <div key={order.id} className="p-6 bg-white rounded-[32px] border border-[#E5EAD7] hover:shadow-xl transition-all relative overflow-hidden flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-[#ECFCCB] text-[#4D7C0F]">
                        Confirmed
                      </span>
                      <span className="text-xs font-bold text-[#5B6D44]">
                        {new Date(order.confirmed_at || order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-black text-[#1A2E05]">{order.product}</h3>
                      <p className="text-sm text-[#5B6D44]">Farmer: <strong className="text-[#1A2E05]">{order.farmer_name || 'Unknown'}</strong></p>
                      <p className="text-sm text-[#5B6D44] italic">"{order.message}"</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-white border-2 border-dashed border-[#E5EAD7] rounded-3xl">
                <div className="w-20 h-20 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
                  <History className="w-10 h-10 text-[#4D7C0F]/40" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[#1A2E05] text-lg">No confirmed orders yet</p>
                  <p className="text-sm text-[#5B6D44]">When a farmer confirms your interest, it will appear here.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Harvest Map View */}
        {activeView === 'map' && (
          <section className="h-[calc(100vh-12rem)] flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#15803D] uppercase tracking-widest">Regional Logistics</p>
                <h1 className="text-4xl font-black text-[#1A2E05]">Harvest Map</h1>
                <p className="text-[#5B6D44]">Find available products in Mindanao</p>
              </div>

              <div className="relative custom-dropdown w-full md:w-56 z-30">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'mapFilter' ? null : 'mapFilter')}
                  className="w-full pl-10 pr-4 py-3 bg-[#F1F4E8] border border-[#E5EAD7] rounded-xl font-bold text-[#1A2E05] text-sm flex items-center justify-between hover:bg-[#E5EAD7]/50 transition-colors"
                >
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4D7C0F]" />
                  <span className="truncate">{mapFilter}</span>
                  <ChevronDown className={cn("w-4 h-4 text-[#5B6D44] transition-transform", openDropdown === 'mapFilter' && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'mapFilter' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+8px)] right-0 w-full bg-white border border-[#E5EAD7] rounded-xl shadow-xl overflow-hidden py-2"
                    >
                      {mapCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setMapFilter(cat); setOpenDropdown(null) }}
                          className={cn(
                            "w-full text-left px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#F7F9F2]",
                            mapFilter === cat ? "text-[#4D7C0F] bg-[#ECFCCB]" : "text-[#5B6D44]"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            <div className="flex-1 relative rounded-[32px] overflow-hidden border border-[#E5EAD7] shadow-xl z-0">
              <MapContainer 
                center={[7.8, 124.3]} 
                zoom={7} 
                minZoom={7} 
                maxBounds={MINDANAO_BOUNDS}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                className="h-full w-full relative z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredMapHarvests.filter(h => h.lat && h.lng).map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]}>
                    <Popup>
                      <div className="p-4 min-w-[200px] space-y-3">
                        <div>
                          <span className="px-2 py-0.5 bg-[#FEF9C3] text-[#A16207] text-[8px] font-black uppercase rounded-full tracking-wider">
                            {h.category}
                          </span>
                          <p className="text-[10px] font-bold text-[#5B6D44] uppercase tracking-widest leading-none mt-1">{h.crop_type}</p>
                          <h4 className="font-black text-[#1A2E05] text-lg">{h.quantity} {h.unit}</h4>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] text-[#5B6D44]">
                            <MapPin className="w-3 h-3" />
                            {h.barangay}, {h.province}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#5B6D44]">
                            <Sprout className="w-3 h-3" />
                            Harvesting {h.harvest_date ? new Date(h.harvest_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <button className="w-full py-2 bg-[#4D7C0F] text-white text-xs font-bold rounded-lg hover:bg-[#3F6212] transition-colors flex items-center justify-center gap-1">
                          <Navigation className="w-3 h-3" />
                          Get Best Route
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E5EAD7] shadow-lg space-y-3 hidden md:block">
                <p className="text-xs font-bold text-[#1A2E05] uppercase tracking-wider">Map Legend</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <span className="text-[11px] text-[#5B6D44]">Active Listings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                    <span className="text-[11px] text-[#5B6D44]">Pending Harvest</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E5EAD7]">
                  <p className="text-[10px] text-[#5B6D44] italic">Updated just now</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Account View (Editable) */}
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
                <p className="text-white/80">Buyer Account</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-[#F7F9F2] p-6 rounded-2xl border border-[#E5EAD7]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1A2E05] text-lg">Personal Information</h3>
                  {!isEditingAccount && (
                    <button 
                      onClick={() => setIsEditingAccount(true)} 
                      className="text-sm font-bold text-[#4D7C0F] hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {accountMessage && (
                  <p className="text-green-600 text-sm font-bold mb-4 bg-green-50 p-2 rounded-lg text-center">
                    {accountMessage}
                  </p>
                )}

                {isEditingAccount ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5B6D44] uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={accountForm.name} 
                        onChange={(e) => setAccountForm({...accountForm, name: e.target.value})} 
                        className="w-full p-3 bg-white rounded-xl border border-[#E5EAD7] outline-none focus:ring-2 focus:ring-[#4D7C0F]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5B6D44] uppercase mb-1">Location</label>
                      <input 
                        type="text" 
                        value={accountForm.location} 
                        onChange={(e) => setAccountForm({...accountForm, location: e.target.value})} 
                        className="w-full p-3 bg-white rounded-xl border border-[#E5EAD7] outline-none focus:ring-2 focus:ring-[#4D7C0F]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5B6D44] uppercase mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={accountForm.phone} 
                        onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})} 
                        className="w-full p-3 bg-white rounded-xl border border-[#E5EAD7] outline-none focus:ring-2 focus:ring-[#4D7C0F]" 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleSaveAccount} 
                        className="flex-1 py-3 bg-[#4D7C0F] text-white rounded-xl font-bold hover:bg-[#3F6212] transition-colors text-sm shadow-md"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={() => {
                          setAccountForm({
                            name: profile?.full_name || user?.user_metadata?.full_name || user?.full_name || 'Buyer',
                            location: profile?.location || profile?.province || user?.user_metadata?.location || 'Philippines',
                            phone: profile?.phone || user?.phone || ''
                          });
                          setIsEditingAccount(false);
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
                    <p className="text-[#5B6D44]"><strong className="text-[#1A2E05]">Role:</strong> Buyer</p>
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