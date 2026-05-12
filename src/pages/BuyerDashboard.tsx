import { useState, useEffect } from 'react'
import {
  ShoppingBag, Bell, CheckCircle, MapPin, Calendar,
  MessageSquare, Send, LogOut, Search, Filter, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

// Mock available harvests from farmers (in real app, fetched from Supabase harvests table)
const AVAILABLE_HARVESTS = [
  {
    id: 'h-1',
    crop: 'Dinorado Rice',
    farmer: 'Juan Dela Cruz',
    qty: '1,200 kg',
    date: 'Oct 15, 2026',
    province: 'Bukidnon',
    status: 'Looking for Buyer',
    pricePerKg: '₱42',
  },
  {
    id: 'h-2',
    crop: 'Sweet Corn',
    farmer: 'Pedro Santos',
    qty: '800 kg',
    date: 'Oct 22, 2026',
    province: 'Nueva Ecija',
    status: 'Looking for Buyer',
    pricePerKg: '₱18',
  },
  {
    id: 'h-3',
    crop: 'Tomatoes',
    farmer: 'Maria Cruz',
    qty: '300 kg',
    date: 'Nov 05, 2026',
    province: 'Batangas',
    status: 'Looking for Buyer',
    pricePerKg: '₱55',
  },
  {
    id: 'h-4',
    crop: 'White Onion',
    farmer: 'Roberto Reyes',
    qty: '500 kg',
    date: 'Nov 10, 2026',
    province: 'Nueva Ecija',
    status: 'Looking for Buyer',
    pricePerKg: '₱90',
  },
  {
    id: 'h-5',
    crop: 'Ampalaya',
    farmer: 'Elena Gomez',
    qty: '150 kg',
    date: 'Nov 20, 2026',
    province: 'Laguna',
    status: 'Looking for Buyer',
    pricePerKg: '₱35',
  },
]

// Harvests this buyer has already expressed interest in (mock)
const MATCHED_HARVESTS = [
  {
    id: 'm-1',
    crop: 'Kangkong',
    farmer: 'Andres Soriano',
    qty: '200 kg',
    date: 'Oct 08, 2026',
    province: 'Pampanga',
    status: 'Matched',
  },
  {
    id: 'm-2',
    crop: 'Kamote',
    farmer: 'Lourdes Bautista',
    qty: '350 kg',
    date: 'Oct 12, 2026',
    province: 'Ilocos Norte',
    status: 'Matched',
  },
]

export default function BuyerDashboard() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [interestedIds, setInterestedIds] = useState<string[]>([])

  const [aiMessage, setAiMessage] = useState('')
  const [chatLog, setChatLog] = useState([
    {
      role: 'ai',
      text: 'Kumusta! Ako si Ani. Bilang buyer, matutulungan kita mahanap ng pinakamababang presyo ng mga pananim. Anong gulay o prutas ang hinahanap mo ngayon?',
    },
  ])

  // Load user from demo localStorage or real Supabase session
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        setProfile(session.user.user_metadata)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('agrilink_user')
    localStorage.removeItem('agrilink_auth')
    window.location.href = '/login'
  }

  const handleExpressInterest = (id: string) => {
    setInterestedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
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
          text: 'May nakita akong available na harvest sa Nueva Ecija na angkop sa iyong hinihanap. Gusto mo bang i-connect kita sa farmer?',
        },
      ])
    }, 1000)
  }

  const filteredHarvests = AVAILABLE_HARVESTS.filter(h =>
    h.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.farmer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Buyer'
  const userLocation = profile?.location || profile?.province || user?.user_metadata?.location || 'Philippines'

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <ShoppingBag className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your dashboard.</p>
          <button
            onClick={() => (window.location.href = '/login')}
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
            <p className="text-sm font-bold text-[#4D7C0F] uppercase tracking-widest">Buyer Portal</p>
            <h1 className="text-4xl font-black text-[#1A2E05]">Browse Harvests</h1>
            <p className="text-[#5B6D44]">Welcome back, {displayName}</p>
            <p className="text-[#5B6D44] text-sm">📍 Location: {userLocation}, Philippines</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all self-start md:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5EAD7]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5B6D44]">Available Harvests</p>
              <ShoppingBag className="w-5 h-5 text-[#4D7C0F]" />
            </div>
            <p className="text-3xl font-black text-[#1A2E05]">{AVAILABLE_HARVESTS.length}</p>
            <p className="text-sm text-[#4D7C0F] mt-1">Open listings from farmers</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5EAD7]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5B6D44]">My Matched Deals</p>
              <CheckCircle className="w-5 h-5 text-[#4D7C0F]" />
            </div>
            <p className="text-3xl font-black text-[#1A2E05]">{MATCHED_HARVESTS.length}</p>
            <p className="text-sm text-[#5B6D44] mt-1">Confirmed with farmers</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5EAD7]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5B6D44]">Pending Responses</p>
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-[#1A2E05]">{interestedIds.length}</p>
            <p className="text-sm text-[#5B6D44] mt-1">Awaiting farmer reply</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Available Harvests */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5EAD7] overflow-hidden">
              <div className="p-6 border-b border-[#E5EAD7]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-[#1A2E05]">Available Harvests</h2>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B6D44]" />
                    <input
                      type="text"
                      placeholder="Search crop, province..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-[#E5EAD7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] bg-[#FDFCF8] w-full sm:w-56"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F7F9F2] text-[#5B6D44] text-xs uppercase tracking-wider">
                      <th className="py-3 px-6 font-bold">Crop</th>
                      <th className="py-3 px-6 font-bold">Farmer</th>
                      <th className="py-3 px-6 font-bold">Quantity</th>
                      <th className="py-3 px-6 font-bold">Harvest Date</th>
                      <th className="py-3 px-6 font-bold">Location</th>
                      <th className="py-3 px-6 font-bold">Price/kg</th>
                      <th className="py-3 px-6 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAD7]">
                    {filteredHarvests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[#5B6D44]">
                          No harvests found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredHarvests.map(row => {
                        const isInterested = interestedIds.includes(row.id)
                        return (
                          <tr key={row.id} className="hover:bg-[#F7F9F2] transition-colors">
                            <td className="py-4 px-6 font-bold text-[#1A2E05]">{row.crop}</td>
                            <td className="py-4 px-6 text-[#5B6D44] text-sm">{row.farmer}</td>
                            <td className="py-4 px-6 text-[#5B6D44] text-sm">{row.qty}</td>
                            <td className="py-4 px-6 text-[#5B6D44] text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#5B6D44]" />
                                {row.date}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-[#5B6D44] text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#5B6D44]" />
                                {row.province}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-[#1A2E05]">{row.pricePerKg}</td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleExpressInterest(row.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  isInterested
                                    ? 'bg-[#ECFCCB] text-[#4D7C0F] border border-[#4D7C0F]/30'
                                    : 'bg-[#4D7C0F] text-white hover:bg-[#3F6212]'
                                }`}
                              >
                                {isInterested ? '✓ Interested' : 'Express Interest'}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My Matched Deals */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5EAD7] overflow-hidden">
              <div className="p-6 border-b border-[#E5EAD7]">
                <h2 className="text-lg font-black text-[#1A2E05]">My Matched Deals</h2>
                <p className="text-sm text-[#5B6D44] mt-1">Harvests you've been confirmed with</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F7F9F2] text-[#5B6D44] text-xs uppercase tracking-wider">
                      <th className="py-3 px-6 font-bold">Crop</th>
                      <th className="py-3 px-6 font-bold">Farmer</th>
                      <th className="py-3 px-6 font-bold">Quantity</th>
                      <th className="py-3 px-6 font-bold">Harvest Date</th>
                      <th className="py-3 px-6 font-bold">Location</th>
                      <th className="py-3 px-6 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAD7]">
                    {MATCHED_HARVESTS.map(row => (
                      <tr key={row.id} className="hover:bg-[#F7F9F2] transition-colors">
                        <td className="py-4 px-6 font-bold text-[#1A2E05]">{row.crop}</td>
                        <td className="py-4 px-6 text-[#5B6D44] text-sm">{row.farmer}</td>
                        <td className="py-4 px-6 text-[#5B6D44] text-sm">{row.qty}</td>
                        <td className="py-4 px-6 text-[#5B6D44] text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#5B6D44]" />
                            {row.date}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#5B6D44] text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#5B6D44]" />
                            {row.province}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#ECFCCB] text-[#4D7C0F]">
                            ✓ {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">

            {/* Harvest Alerts */}
            <div className="bg-gradient-to-br from-[#4D7C0F] to-[#7CB342] rounded-2xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-lg">New Harvest Alerts</h3>
              </div>
              <div className="space-y-3">
                {[
                  { crop: 'Malunggay', province: 'Bukidnon', qty: '100 kg', time: '2 hrs ago' },
                  { crop: 'Sitaw', province: 'Nueva Ecija', qty: '250 kg', time: '5 hrs ago' },
                  { crop: 'Okra', province: 'Batangas', qty: '80 kg', time: '1 day ago' },
                ].map((alert, i) => (
                  <div key={i} className="bg-white/15 rounded-xl p-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm">{alert.crop}</p>
                      <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {alert.province} · {alert.qty}
                      </p>
                    </div>
                    <span className="text-white/60 text-xs shrink-0">{alert.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs mt-4 text-center">
                Alerts are updated in real-time
              </p>
            </div>

            {/* AI Assistant */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5EAD7] flex flex-col h-[420px]">
              <div className="p-4 border-b border-[#E5EAD7] bg-[#F7F9F2] rounded-t-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4D7C0F] flex items-center justify-center text-white shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2E05]">Ani AI Assistant</h3>
                  <p className="text-xs text-[#5B6D44]">Buyer-focused · Taglish supported</p>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-[#4D7C0F] text-white rounded-br-none'
                          : 'bg-[#F1F4E8] text-[#1A2E05] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-[#E5EAD7]">
                <form onSubmit={handleSendAi} className="flex gap-2">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={e => setAiMessage(e.target.value)}
                    placeholder="Anong gulay ang hinahanap mo?"
                    className="flex-1 border border-[#E5EAD7] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] bg-[#FDFCF8]"
                  />
                  <button
                    type="submit"
                    disabled={!aiMessage.trim()}
                    className="bg-[#4D7C0F] text-white p-2 rounded-full hover:bg-[#3F6212] transition-colors flex items-center justify-center shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}