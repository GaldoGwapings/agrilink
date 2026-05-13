import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sprout, ShoppingBag, ArrowRight, ChevronLeft, Smartphone, Info, CheckCircle, Loader2 } from "lucide-react";
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

  // Check if already logged in
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

  const handleSendOtp = async () => {
    if (!phone) {
      showMessage('Please enter your phone number.', 'error');
      return;
    }

    setLoading(true);
    const cleanPhone = normalizePhone(phone);
    setPhone(cleanPhone);

    // For test phone number - bypass Supabase
    if (cleanPhone === '+639488297163') {
      setOtpSent(true);
      showMessage('Test OTP sent! Use code: 696969', 'success');
      setLoading(false);
      return;
    }

    // For real phone numbers with Supabase
    const { error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
      options: {
        shouldCreateUser: !isLogin,
        data: {
          full_name: fullName,
          role,
          location,
        }
      },
    });

    if (error) {
      showMessage(error.message, 'error');
    } else {
      setOtpSent(true);
      showMessage('OTP sent! Enter the code below.', 'success');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showMessage('Please enter the verification code.', 'error');
      return;
    }

    setLoading(true);
    const cleanPhone = normalizePhone(phone);

    // For test phone number - create demo session (NO EMAIL INVOLVED)
    if (cleanPhone === '+639488297163' && otp === '696969') {
      // Create a demo user object (this is for testing, no Supabase email)
      const demoUser = {
        id: `demo_${Date.now()}`,
        phone: cleanPhone,
        user_metadata: {
          full_name: fullName || 'Demo Farmer',
          role: role,
          location: location || 'Bukidnon'
        }
      };
      
      // Store in localStorage for demo mode
      localStorage.setItem('agrilink_user', JSON.stringify(demoUser));
      localStorage.setItem('agrilink_auth', 'demo_mode');
      
      showMessage('Login successful! Redirecting...', 'success');
      setRedirecting(true);
      
      setTimeout(() => {
        navigate(role === 'buyer' ? '/buyer' : '/farmer');
      }, 1500);
      
      setLoading(false);
      return;
    }

    // Real OTP verification with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: cleanPhone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      showMessage(error.message, 'error');
      setLoading(false);
      return;
    }

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
    if (otpSent) {
      await handleVerifyOtp();
    } else {
      await handleSendOtp();
    }
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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-[#E5EAD7] overflow-hidden grid lg:grid-cols-2"
      >
        <div className="bg-[#4D7C0F] p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Sprout className="w-64 h-64" />
          </div>
          <div className="space-y-6 relative z-10">
            <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm font-bold text-white/80 hover:text-white">
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-xl">
                <Sprout className="text-[#4D7C0F] w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">AgriLink</span>
            </div>
            <h2 className="text-4xl font-black leading-tight">Bridge the Gap <br /> Field to Market.</h2>
            <p className="text-white/80 text-lg">Mag-register gamit ang iyong phone number para makakonekta sa mga buyer.</p>
          </div>
        </div>

        <div className="p-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#1A2E05]">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-[#5B6D44]">Gamitin ang iyong mobile number</p>
          </div>

          {/* Test Credentials Notice */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">📱 Demo Mode Available</p>
                <p className="text-xs text-green-700 mt-1">
                  Gamitin ang test account para makapasok agad:
                </p>
                <p className="text-xs font-mono font-bold text-green-800 mt-2">
                  Phone: 09488297163<br />
                  OTP: 696969
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setRole('farmer')} 
              className={cn(
                "p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer",
                role === 'farmer' 
                  ? "border-[#4D7C0F] bg-[#ECFCCB]/50 text-[#1A2E05]" 
                  : "border-[#E5EAD7] text-[#5B6D44] hover:border-[#4D7C0F]/30"
              )}
            >
              <Sprout className={cn("w-8 h-8", role === 'farmer' ? "text-[#4D7C0F]" : "text-[#5B6D44]")} />
              <span className="font-bold">Magbubukid (Farmer)</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('buyer')} 
              className={cn(
                "p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer",
                role === 'buyer' 
                  ? "border-[#4D7C0F] bg-[#ECFCCB]/50 text-[#1A2E05]" 
                  : "border-[#E5EAD7] text-[#5B6D44] hover:border-[#4D7C0F]/30"
              )}
            >
              <ShoppingBag className={cn("w-8 h-8", role === 'buyer' ? "text-[#4D7C0F]" : "text-[#5B6D44]")} />
              <span className="font-bold">Bibili (Buyer)</span>
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">Buong Pangalan (Full Name)</label>
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
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">Lokasyon / Probinsya (Location)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bukidnon, Nueva Ecija" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all" 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">Numero ng Telepono (Phone Number)</label>
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

            {otpSent && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#5B6D44]">OTP Code</label>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>
            )}

            {message && (
              <p className={`text-sm ${messageType === 'success' ? 'text-green-600' : 'text-red-500'} text-center`}>
                {message}
              </p>
            )}

            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-[#4D7C0F] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3F6212] transition-colors shadow-lg shadow-[#4D7C0F]/20 disabled:opacity-50 cursor-pointer"
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

          <div className="text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setOtpSent(false);
                setOtp('');
                setMessage('');
                setPhone('');
              }} 
              className="text-sm font-bold text-[#4D7C0F] hover:underline cursor-pointer"
            >
              {isLogin ? "Walang account? Mag-register" : "May account na? Mag-login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}