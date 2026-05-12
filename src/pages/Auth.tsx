import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('farmer')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          role,
        })
        setMessage('Account created! You can now log in.')
        setIsLogin(true)
      }
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

        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {isLogin ? 'Login to your account' : 'Create an account'}
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

        {message && <p className="text-sm text-red-500 mb-3">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            className="text-green-600 cursor-pointer font-semibold"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}


