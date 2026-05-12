import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email')

  // Email fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('farmer')

  // Phone fields
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const showMessage = (text: string, type: 'error' | 'success') => {
    setMessage(text)
    setMessageType(type)
  }

  // ----- EMAIL HANDLERS -----
  const handleEmailAuth = async () => {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) showMessage(error.message, 'error')
      // If successful, your app's auth listener (App.tsx) will handle the redirect
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role }
        }
      })

      if (error) {
        showMessage(error.message, 'error')
      } else if (data.session) {
        // Email confirmation is DISABLED in Supabase — user is immediately active
        // Your app's auth listener will redirect to dashboard automatically
        showMessage('Account created! Redirecting...', 'success')
      } else {
        // Email confirmation is ENABLED — session is null until they click the link
        // DO NOT redirect or switch to login here
        showMessage(
          '✅ Registration successful! Please check your email and click the confirmation link before logging in.',
          'success'
        )
      }
    }

    setLoading(false)
  }

  // ----- PHONE HANDLERS -----
  const handleSendOtp = async () => {
    setLoading(true)
    setMessage('')

    const cleanPhone = phone.startsWith('+63')
      ? phone
      : `+63${phone.replace(/^0/, '')}`
    setPhone(cleanPhone)

    const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone })
    if (error) {
      showMessage(error.message, 'error')
    } else {
      setOtpSent(true)
      showMessage('OTP sent! Enter the code below.', 'success')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    })

    if (error) {
      showMessage(error.message, 'error')
    } else if (data.user) {
      // Save name/role to both user metadata and profiles table
      if (fullName || role) {
        await supabase.auth.updateUser({
          data: { full_name: fullName, role }
        })
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role,
          phone: data.user.phone,
        })
      }
      // Your app's auth listener will handle the redirect
      showMessage('Phone verified! Redirecting...', 'success')
      setOtpSent(false)
      setOtp('')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-700">🌾 AgriLink</h1>
          <p className="text-gray-500 mt-1">Smart Harvest Forecasting</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
          <button
            className={`flex-1 py-2 text-sm font-semibold ${
              authMode === 'email' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setAuthMode('email')}
          >
            📧 Email
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold ${
              authMode === 'phone' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setAuthMode('phone')}
          >
            📱 Phone (SMS)
          </button>
        </div>

        {/* EMAIL FORM */}
        {authMode === 'email' && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {isLogin ? 'Login with Email' : 'Create an Account'}
            </h2>

            {!isLogin && (
              <>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <label className="block text-sm text-gray-600 mb-1">I am a...</label>
                <select
                  className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                  <option value="logistics">Logistics Provider</option>
                </select>
              </>
            )}

            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="email@example.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {message && (
              <p className={`text-sm mb-3 ${messageType === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <span
                className="text-green-600 cursor-pointer font-semibold"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage('')
                }}
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </p>
          </>
        )}

        {/* PHONE FORM */}
        {authMode === 'phone' && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {otpSent ? 'Enter OTP' : 'Login with Phone'}
            </h2>

            {!otpSent && (
              <>
                <label className="block text-sm text-gray-600 mb-1">Mobile Number</label>
                <input
                  className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="+639123456789"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <label className="block text-sm text-gray-600 mb-1">Full Name (optional)</label>
                <input
                  className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <label className="block text-sm text-gray-600 mb-1">I am a...</label>
                <select
                  className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                  <option value="logistics">Logistics Provider</option>
                </select>
              </>
            )}

            {otpSent && (
              <>
                <label className="block text-sm text-gray-600 mb-1">Verification Code</label>
                <input
                  className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                />
              </>
            )}

            {message && (
              <p className={`text-sm mb-3 ${messageType === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            )}

            {otpSent && (
              <p
                className="text-center text-sm text-green-600 mt-4 cursor-pointer"
                onClick={() => {
                  setOtpSent(false)
                  setMessage('')
                }}
              >
                ← Change phone number
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}