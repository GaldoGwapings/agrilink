import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Sprout, ShoppingBag, ArrowRight, User as UserIcon } from "lucide-react";
import type { User } from "../types";
import { cn } from "@/lib/utils";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string }>({});

  const validateIdentifier = (value: string) => {
    if (!value) return "";
    
    // Check if it's likely an email
    if (value.includes('@') || /[a-zA-Z]/.test(value)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address (e.g. user@example.com)";
      }
    } else {
      // Check if it's a contact number
      const phoneRegex = /^\d+$/;
      if (!phoneRegex.test(value)) {
        return "Contact number must contain numbers only";
      }
      if (value.length < 11) {
        return "Invalid contact number";
      }
    }
    return "";
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    const error = validateIdentifier(value);
    setErrors({ ...errors, identifier: error });
  };

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    const identifierError = validateIdentifier(identifier);
    if (identifierError) {
      setErrors({ ...errors, identifier: identifierError });
      return;
    }
    if (!identifier || !password) return;
    if (!isLogin && !fullName) return;

    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      email: identifier.includes('@') ? identifier : '',
      role: role as any,
      fullName: isLogin ? "Juan Dela Cruz" : fullName,
      region: isLogin ? (role === 'farmer' ? 'Bukidnon' : 'All') : location
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-[#E5EAD7] overflow-hidden grid lg:grid-cols-2"
      >
        {/* Left Side: Branding/Context */}
        <div className="bg-[#4D7C0F] p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Sprout className="w-64 h-64" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-xl">
                <Sprout className="text-[#4D7C0F] w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">AgriLink</span>
            </div>
            <h2 className="text-4xl font-black leading-tight">
              Bridge the Gap <br /> Field to Market.
            </h2>
            <p className="text-white/80 text-lg">
              Join thousands of Filipino farmers and buyers reducing waste and building a sustainable supply chain.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#1A2E05]">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-[#5B6D44]">Choose your role and {isLogin ? 'sign in' : 'sign up'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole('farmer')}
              className={cn(
                "p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all",
                role === 'farmer' 
                  ? "border-[#4D7C0F] bg-[#ECFCCB]/50 text-[#1A2E05]" 
                  : "border-[#E5EAD7] text-[#5B6D44] hover:border-[#4D7C0F]/30"
              )}
            >
              <Sprout className={cn("w-8 h-8", role === 'farmer' ? "text-[#4D7C0F]" : "text-[#5B6D44]")} />
              <span className="font-bold">Farmer</span>
            </button>
            <button
              onClick={() => setRole('buyer')}
              className={cn(
                "p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all",
                role === 'buyer' 
                  ? "border-[#4D7C0F] bg-[#ECFCCB]/50 text-[#1A2E05]" 
                  : "border-[#E5EAD7] text-[#5B6D44] hover:border-[#4D7C0F]/30"
              )}
            >
              <ShoppingBag className={cn("w-8 h-8", role === 'buyer' ? "text-[#4D7C0F]" : "text-[#5B6D44]")} />
              <span className="font-bold">Buyer</span>
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">Full Name</label>
                  <input
                    type="text"
                    placeholder="Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">Contact Number or Email</label>
              <input
                type="text"
                placeholder="juan@example.com or 09123456789"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                className={cn(
                  "w-full bg-[#FDFCF8] border rounded-2xl py-4 px-4 outline-none transition-all focus:ring-2",
                  errors.identifier 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-[#E5EAD7] focus:ring-[#4D7C0F]"
                )}
                required
              />
              {errors.identifier && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">
                  {errors.identifier}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!!errors.identifier}
              className="w-full py-4 bg-[#4D7C0F] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3F6212] transition-colors shadow-lg shadow-[#4D7C0F]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center space-y-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-[#4D7C0F] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            <p className="text-xs text-[#5B6D44]">
              By continuing, you agree to AgriLink's <button className="underline font-bold">Terms of Service</button>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


