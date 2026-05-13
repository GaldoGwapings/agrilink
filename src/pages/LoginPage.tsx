import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, ShoppingBag, ArrowRight, ChevronLeft, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('63')) return `+${digits}`;
    if (digits.startsWith('0')) return `+63${digits.slice(1)}`;
    if (digits.startsWith('9')) return `+63${digits}`;
    return `+${digits}`;
  };

  const showMessage = (text: string, type: 'error' | 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Resets the OTP and message states when switching between Farmer and Buyer
  const handleRoleSwitch = (newRole: 'farmer' | 'buyer') => {
    setRole(newRole);
    setOtpSent(false);
    setOtp("");
    setMessage("");
  };

  const handleSendOtp = async () => {
    // Form validation
    if (!isLogin) {
      if (!fullName.trim() || !location.trim() || !phone.trim()) {
        showMessage('Please fill in all required fields.', 'error');
        return;
      }
      if (!agreeTerms) {
        showMessage('Please agree to the Terms & Conditions.', 'error');
        return;
      }
    } else {
      if (!phone.trim()) {
        showMessage('Please enter your phone number.', 'error');
        return;
      }
    }
    
    setLoading(true);
    const cleanPhone = normalizePhone(phone);
    setPhone(cleanPhone);

    if (cleanPhone === '+639488297163') {
      setOtpSent(true);
      showMessage('OTP sent! Enter the code.', 'success');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
      options: { shouldCreateUser: !isLogin, data: { full_name: fullName, role, location } },
    });

    if (error) { showMessage(error.message, 'error'); }
    else { setOtpSent(true); showMessage('OTP sent! Enter the code.', 'success'); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) { showMessage('Please enter the verification code.', 'error'); return; }
    setLoading(true);
    const cleanPhone = normalizePhone(phone);

    if (cleanPhone === '+639488297163' && otp === '696969') {
      const demoUser = {
        id: `demo_${Date.now()}`,
        phone: cleanPhone,
        user_metadata: { full_name: fullName || 'Demo Farmer', role, location: location || 'Bukidnon' }
      };
      localStorage.setItem('agrilink_user', JSON.stringify(demoUser));
      localStorage.setItem('agrilink_auth', 'demo_mode');
      showMessage('Login successful! Redirecting...', 'success');
      setRedirecting(true);
      setTimeout(() => navigate(role === 'buyer' ? '/buyer' : '/farmer'), 1500);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({ phone: cleanPhone, token: otp, type: 'sms' });
    if (error) { showMessage(error.message, 'error'); setLoading(false); return; }
    if (data.session) {
      showMessage('Phone verified! Redirecting...', 'success');
      setRedirecting(true);
      setTimeout(() => {
        const userRole = data.session?.user?.user_metadata?.role || role;
        navigate(userRole === 'buyer' ? '/buyer' : '/farmer');
      }, 1500);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (otpSent) await handleVerifyOtp();
    else await handleSendOtp();
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
            isLogin ? "bg-[#4D7C0F]" : "bg-[#3F6212]", // Panel changes color dynamically
            role === 'buyer' ? 'lg:order-2' : 'lg:order-1'
          )}
        >
          {/* TOP: back + logo + heading + subtext */}
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
              <h2 className="text-4xl font-black leading-tight">
                Bridge the Gap <br /> Field to Market.
              </h2>
              <p className="text-white/80 text-lg mt-4 leading-relaxed">
                Join thousands of Filipino farmers and buyers reducing waste and building a sustainable supply chain.
              </p>
            </div>
          </div>

          {/* BOTTOM: decorative leaf icon */}
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
          {/* Wrapper to enforce perfect alignment bounds */}
          <div className="w-full max-w-[400px] flex flex-col">
            
            {/* Heading text */}
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
                <Sprout className="w-4 h-4" />
                Farmer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('buyer')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors duration-200",
                  role === 'buyer' ? "text-white" : "text-[#5B6D44] hover:text-[#1A2E05]"
                )}
              >
                <ShoppingBag className="w-4 h-4" />
                Buyer
              </button>
            </div>

            {/* Input fields and Submit button block */}
            <div className="space-y-6 w-full mb-6">
              {!isLogin && (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
                  />
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bukidnon, Nueva Ecija"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">
                  Phone Number {!isLogin && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
                  <input
                    type="tel"
                    placeholder="09488297163"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
                    required
                    disabled={otpSent}
                  />
                </div>
              </div>

              <AnimatePresence>
                {otpSent && (
                  <motion.div
                    className="space-y-2 text-left"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44] block">OTP Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {message && (
                <p className={cn(
                  "text-sm text-center font-medium",
                  messageType === 'success' ? 'text-green-600' : 'text-red-500'
                )}>
                  {message}
                </p>
              )}

              {/* Terms and Conditions */}
              {!isLogin && (
                <div className="flex items-start gap-2 text-left w-full px-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={cn("mt-0.5 w-4 h-4 cursor-pointer rounded transition-colors", isLogin ? "accent-[#4D7C0F]" : "accent-[#3F6212]")}
                  />
                  <label htmlFor="terms" className="text-xs text-[#5B6D44] cursor-pointer select-none leading-tight">
                    By creating an account, I agree to the <span className={cn("font-bold hover:underline transition-colors", isLogin ? "text-[#4D7C0F]" : "text-[#3F6212]")}>Terms & Conditions</span>.
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
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {otpSent ? 'Verify OTP' : (isLogin ? 'Send OTP' : 'Register & Send OTP')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Switch Mode Link */}
            <div className="w-full flex flex-col space-y-4">
              <div className="text-center w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setOtpSent(false);
                    setOtp('');
                    setMessage('');
                    setPhone('');
                    setAgreeTerms(false);
                  }}
                  className={cn("text-sm font-bold hover:underline transition-colors duration-500", isLogin ? "text-[#4D7C0F]" : "text-[#3F6212]")}
                >
                  {isLogin 
                    ? "No account? Register" 
                    : "Already have an account? Login"}
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}