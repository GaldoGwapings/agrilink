import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sprout, Menu, X, User, LogOut, LayoutDashboard, Map, Users, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

interface NavbarProps {
  user?: any
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(propUser || null)

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setCurrentUser(user)
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        } else {
          setProfile({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: user.user_metadata?.role || 'farmer'
          })
        }
      }
      setLoading(false)
    }

    if (!propUser) {
      fetchUserAndProfile()
    } else {
      setCurrentUser(propUser)
      setProfile({
        full_name: propUser.name || propUser.full_name || 'User',
        role: propUser.role || 'farmer'
      })
      setLoading(false)
    }
  }, [propUser])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
    setIsMenuOpen(false)
  }

  const userRole = profile?.role || currentUser?.user_metadata?.role || currentUser?.role || 'farmer'
  const displayName = profile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User'

  const navLinks = userRole === 'farmer' ? [
    { to: '/farmer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/home', label: 'Home', icon: Sprout },
    { to: '/map', label: 'Harvest Map', icon: Map },
    { to: '/farmer/interested-buyers', label: 'Interested Buyers', icon: Users },
  ] : [
    { to: '/buyer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/buyer/home', label: 'Home', icon: Sprout },
    { to: '/map', label: 'Harvest Map', icon: Map },
    { to: '/buyer/listings', label: 'Find Harvests', icon: ShoppingBag },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5EAD7] shadow-sm">
      <div className="max-w-8xl mx-auto px-4 lg:px-7">
        <div className="flex items-center justify-between h-20">

          {/* LEFT SIDE: AgriLink Logo */}
          <Link
            to={currentUser ? (userRole === 'farmer' ? '/farmer/home' : '/buyer/home') : '/'}
            className="flex items-center gap-2 group"
          >
            <div className="bg-[#4D7C0F] p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-[#1A2E05] tracking-tight">AgriLink</span>
          </Link>

          {/* RIGHT SIDE: Nav links + Sign In button (or user info when logged in) */}
          <div className="hidden md:flex items-center gap-6">
            {currentUser && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 text-[#5B6D44] hover:text-[#4D7C0F] font-medium transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {currentUser ? (
              <div className="flex items-center gap-4 pl-4 border-l border-[#E5EAD7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ECFCCB] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#4D7C0F]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#1A2E05]">
                      {loading ? '...' : displayName}
                    </p>
                    <p className="text-[10px] font-bold text-[#5B6D44] uppercase tracking-wider">
                      {userRole === 'farmer' ? 'Farmer' : userRole === 'buyer' ? 'Buyer' : userRole}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-[#4D7C0F] text-white font-bold rounded-xl hover:bg-[#3F6212] transition-colors shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#F1F4E8] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5EAD7] space-y-3">
            {currentUser && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-[#5B6D44] hover:text-[#4D7C0F] hover:bg-[#F1F4E8] rounded-xl transition-colors"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}

            {currentUser ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[#E5EAD7] mt-2 pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#ECFCCB] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#4D7C0F]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2E05]">{displayName}</p>
                    <p className="text-xs text-[#5B6D44] capitalize">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 bg-[#4D7C0F] text-white font-bold rounded-xl text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}