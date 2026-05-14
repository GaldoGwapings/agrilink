import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, ShoppingBag, ArrowRight, ChevronLeft, Mail, Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [redirecting, setRedirecting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userRole = session.user.user_metadata?.role || 'farmer';
        navigate(userRole === 'buyer' ? '/buyer' : '/farmer');
      }
    };
    checkSession();
  }, [navigate]);

  const showMessage = (text: string, type: 'error' | 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 6000);
  };

  const handleRoleSwitch = (newRole: 'farmer' | 'buyer') => {
    setRole(newRole);
    setMessage("");
  };

  const handleSubmit = async () => {
    setMessage('');

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        showMessage('Please enter your email and password.', 'error');
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showMessage(error.message, 'error');
      } else if (data.user && !data.user.email_confirmed_at) {
        showMessage('Please verify your email before logging in. Check your inbox.', 'error');
        await supabase.auth.signOut();
      } else if (data.session) {
        showMessage('Login successful! Redirecting...', 'success');
        setRedirecting(true);
        setTimeout(() => {
          const userRole = data.session?.user?.user_metadata?.role || role;
          navigate(userRole === 'buyer' ? '/buyer' : '/farmer');
        }, 1500);
      }
      setLoading(false);
      return;
    }

    if (!fullName.trim() || !location.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error');
      return;
    }
    if (!agreeTerms) {
      showMessage('Please agree to the Terms & Conditions.', 'error');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, location },
      },
    });

    if (error) {
      showMessage(error.message, 'error');
    } else if (data.session) {
      showMessage('Account created! Redirecting...', 'success');
      setRedirecting(true);
      setTimeout(() => navigate(role === 'buyer' ? '/buyer' : '/farmer'), 1500);
    } else {
      showMessage(
        '✅ Registration successful! Please check your email and click the confirmation link before logging in.',
        'success'
      );
    }
    setLoading(false);
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-green-800">Redirecting...</h2>
          <p className="text-gray-600 mt-2">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl border border-[#E5EAD7] overflow-hidden grid lg:grid-cols-2 min-h-[640px]"
      >
        {/* ── LEFT PANEL ── */}
        <motion.div
          layout
          className={cn(
            "p-12 text-white flex flex-col justify-between relative overflow-hidden h-full transition-colors duration-500",
            isLogin ? "bg-[#4D7C0F]" : "bg-[#3F6212]",
            role === 'buyer' ? 'lg:order-2' : 'lg:order-1'
          )}
        >
          <div className="space-y-6 relative z-10 text-left">
            <div className={cn("flex w-full transition-all duration-300", role === 'buyer' ? "justify-end" : "justify-start")}>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-sm font-bold text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-xl">
                <Sprout className={cn("w-6 h-6 transition-colors duration-500", isLogin ? "text-[#4D7C0F]" : "text-[#3F6212]")} />
              </div>
              <span className="text-2xl font-bold tracking-tight">AgriLink</span>
            </div>
            <div>
              <h2 className="text-4xl font-black leading-tight">Bridge the Gap <br /> Field to Market.</h2>
              <p className="text-white/80 text-lg mt-4 leading-relaxed">
                Join thousands of Filipino farmers and buyers reducing waste and building a sustainable supply chain.
              </p>
            </div>
          </div>
          <div className="relative z-10 flex justify-end mt-8">
            <Sprout className="w-28 h-28 text-white/20" />
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          layout
          className={cn(
            "p-12 flex flex-col justify-center items-center h-full",
            role === 'buyer' ? 'lg:order-1' : 'lg:order-2'
          )}
        >
          <div className="w-full max-w-[400px] flex flex-col">
            <div className="text-left mb-3">
              <h1 className="text-3xl font-black text-[#1A2E05]">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h1>
            </div>

            {/* Role segmented control */}
            <div className="relative bg-[#F1F4E8] rounded-2xl p-1 flex gap-1 w-full mb-6">
              <motion.div
                className={cn("absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-md transition-colors duration-500", isLogin ? "bg-[#4D7C0F]" : "bg-[#3F6212]")}
                animate={{ left: role === 'farmer' ? '4px' : 'calc(50%)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
              <button
                type="button"
                onClick={() => handleRoleSwitch('farmer')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors duration-200",
                  role === 'farmer' ? "text-white" : "text-[#5B6D44] hover:text-[#1A2E05]"
                )}
              >
                <Sprout className="w-4 h-4" /> Farmer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('buyer')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors duration-200",
                  role === 'buyer' ? "text-white" : "text-[#5B6D44] hover:text-[#1A2E05]"
                )}
              >
                <ShoppingBag className="w-4 h-4" /> Buyer
              </button>
            </div>

            <div className="space-y-4 w-full mb-6">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div className="space-y-2 text-left" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Juan Dela Cruz" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div className="space-y-2 text-left" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">Location <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. Bukidnon, Nueva Ecija" value={location} onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
                  <input
                    type="email"
                    placeholder="juan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all [&::-ms-reveal]:hidden"
                  />
                  {/* Custom Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6D44] hover:text-[#1A2E05] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div className="space-y-2 text-left" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all [&::-ms-reveal]:hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6D44] hover:text-[#1A2E05] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {message && (
                <p className={cn("text-sm text-center font-medium", messageType === 'success' ? 'text-green-600' : 'text-red-500')}>
                  {message}
                </p>
              )}

              {!isLogin && (
                <div className="flex items-start gap-2 text-left w-full px-1">
                  <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={cn("mt-0.5 w-4 h-4 cursor-pointer rounded transition-colors", isLogin ? "accent-[#4D7C0F]" : "accent-[#3F6212]")} />
                  <label htmlFor="terms" className="text-xs text-[#5B6D44] cursor-pointer select-none leading-tight">
                    By creating an account, I agree to the{' '}
                    <span className={cn("font-bold hover:underline transition-colors", isLogin ? "text-[#4D7C0F]" : "text-[#3F6212]")}>Terms & Conditions</span>.
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={cn(
                  "w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors duration-500 shadow-lg disabled:opacity-50",
                  isLogin ? "bg-[#4D7C0F] hover:bg-[#3F6212] shadow-[#4D7C0F]/20" : "bg-[#3F6212] hover:bg-[#2C460D] shadow-[#3F6212]/20"
                )}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>

            <div className="w-full text-center">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setMessage(''); setPassword(''); setConfirmPassword(''); setAgreeTerms(false); setShowPassword(false); setShowConfirmPassword(false); }}
                className={cn("text-sm font-bold hover:underline transition-colors duration-500", isLogin ? "text-[#4D7C0F]" : "text-[#3F6212]")}
              >
                {isLogin ? "No account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}