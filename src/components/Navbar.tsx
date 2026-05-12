import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, Map, LayoutDashboard, User as UserIcon, Bell } from "lucide-react";
import { cn } from "../lib/utils";
import type { User } from "../types";
import { MOCK_BUYER_LEADS } from "../mockData";

interface NavbarProps {
  user?: User | null;
  setUser?: (user: User | null) => void;
  onLogout?: () => void;
}

export default function Navbar({ user, setUser, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const toggleRole = () => {
    if (!user || !setUser) return;
    const newRole = user.role === 'farmer' ? 'buyer' : 'farmer';
    setUser({ ...user, role: newRole });
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  const navItems = [
  { 
    name: "Home", 
    path: user?.role === 'farmer' ? '/farmer/home' : user?.role === 'buyer' ? '/buyer/home' : '/', 
    icon: Sprout 
  },
  ...(user?.role === 'farmer' ? [{ name: "My Harvests", path: "/farmer", icon: LayoutDashboard }] : []),
  ...(user?.role === 'buyer' ? [{ name: "Map", path: "/map", icon: Map }] : []),
  ...(user?.role === 'buyer' ? [{ name: "Marketplace", path: "/buyer", icon: LayoutDashboard }] : []),
];

  const pendingLeads = user
    ? MOCK_BUYER_LEADS.filter(b => b.status === 'pending' && b.farmerId === user.id).length
    : 0;

  return (
    <nav className="sticky top-0 z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-[#E5EAD7] px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#4D7C0F] p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1A2E05]">
            Agri<span className="text-[#4D7C0F]">Link</span>
          </span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#4D7C0F]",
                  location.pathname === item.path ? "text-[#4D7C0F]" : "text-[#5B6D44]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {!user ? (
            <Link
              to="/login"
              className="px-5 py-2 bg-[#4D7C0F] text-white rounded-xl font-bold text-sm hover:bg-[#3F6212] transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <>
              {user.role === 'farmer' && (
                <button
                      onClick={() => navigate('/farmer/interested-buyers')}
                      className="relative p-2 text-[#5B6D44] hover:text-[#4D7C0F] transition-colors cursor-pointer"
                    >
                  <Bell className="w-5 h-5" />
                  {pendingLeads > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white">
                      {pendingLeads}
                    </span>
                  )}
                </button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-[#E5EAD7] group relative">
                <div className="w-8 h-8 rounded-full bg-[#E5EAD7] flex items-center justify-center text-[#4D7C0F] cursor-pointer">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="hidden lg:block cursor-pointer">
                  <p className="text-xs font-bold leading-none">{user.fullName || user.name}</p>
                  <p className="text-[10px] text-[#5B6D44] uppercase tracking-wider">{user.role}</p>
                </div>

                {/* Logout dropdown */}
                <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-[#E5EAD7] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}