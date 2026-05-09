import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }: { session: any }) {
  const [harvests, setHarvests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    crop_type: '',
    quantity: '',
    unit: 'kg',
    harvest_date: '',
    barangay: '',
    province: '',
  })

  const fetchHarvests = async () => {
    const { data } = await supabase
      .from('harvests')
      .select('*')
      .eq('farmer_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setHarvests(data)
  }

  useEffect(() => { fetchHarvests() }, [])

  const handleSubmit = async () => {
    setLoading(true)
    await supabase.from('harvests').insert({
      farmer_id: session.user.id,
      crop_type: form.crop_type,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      harvest_date: form.harvest_date,
      barangay: form.barangay,
      province: form.province,
    })
    setForm({ crop_type: '', quantity: '', unit: 'kg', harvest_date: '', barangay: '', province: '' })
    setShowForm(false)
    setLoading(false)
    fetchHarvests()
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">🌾 AgriLink</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Welcome, {session.user.email}!</h2>
          <p className="text-gray-500 mt-1">Manage your upcoming harvests below.</p>
        </div>

        {/* Add Harvest Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">My Harvests</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {showForm ? 'Cancel' : '+ Add Harvest'}
          </button>
        </div>

        {/* Add Harvest Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">New Harvest Listing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Crop Type</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Corn, Tomato"
                  value={form.crop_type}
                  onChange={e => setForm({ ...form, crop_type: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. 50"
                  type="number"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Unit</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="sack">Sacks</option>
                  <option value="cavan">Cavan</option>
                  <option value="piece">Pieces</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Harvest Date</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                  type="date"
                  value={form.harvest_date}
                  onChange={e => setForm({ ...form, harvest_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Barangay</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Brgy. San Jose"
                  value={form.barangay}
                  onChange={e => setForm({ ...form, barangay: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Province</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Bukidnon"
                  value={form.province}
                  onChange={e => setForm({ ...form, province: e.target.value })}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg"
            >
              {loading ? 'Saving...' : 'Submit Harvest'}
            </button>
          </div>
        )}

        {/* Harvest List */}
        {harvests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
            No harvests listed yet. Click "+ Add Harvest" to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {harvests.map(h => (
              <div key={h.id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-green-700">{h.crop_type}</h4>
                  <p className="text-gray-500 text-sm">{h.quantity} {h.unit} · {h.barangay}, {h.province}</p>
                  <p className="text-gray-400 text-sm">Harvest Date: {h.harvest_date}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}