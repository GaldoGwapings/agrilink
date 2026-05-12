import { useState, useEffect } from 'react'
import { parseHarvestDescription } from '../lib/gemini'
import { Sparkles, Loader2 } from 'lucide-react'

interface HarvestFormProps {
  onSuccess: (data: any) => void
  initialData?: any
  isEdit?: boolean
}

export default function HarvestForm({ onSuccess, initialData, isEdit }: HarvestFormProps) {
  const [formData, setFormData] = useState({
    cropType: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    price: '',
    province: '',
    barangay: '',
    harvestDate: '',
    description: ''
  })

  const [aiDescription, setAiDescription] = useState('')
  const [isAiParsing, setIsAiParsing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        cropType: initialData.cropType || '',
        category: initialData.category || 'Vegetables',
        quantity: initialData.quantity?.toString() || '',
        unit: initialData.unit || 'kg',
        price: initialData.price?.toString() || '',
        province: initialData.province || '',
        barangay: initialData.barangay || '',
        harvestDate: initialData.harvestDate || '',
        description: initialData.description || ''
      })
    }
  }, [initialData])

  const handleAiParse = async () => {
    if (!aiDescription.trim()) return
    setIsAiParsing(true)
    try {
      const parsed = await parseHarvestDescription(aiDescription)
      if (parsed.cropName) {
        setFormData(prev => ({
          ...prev,
          cropType: parsed.cropName,
          category: parsed.category,
          quantity: parsed.quantity.toString(),
          unit: parsed.unit,
          price: parsed.price.toString(),
          province: parsed.province,
          barangay: parsed.barangay || '',
          harvestDate: parsed.targetDate
        }))
        setAiDescription('')
      }
    } catch (error) {
      console.error('AI parse error:', error)
    } finally {
      setIsAiParsing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    onSuccess({
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      price: parseFloat(formData.price) || 0
    })
    setLoading(false)
    if (!isEdit) {
      setFormData({
        cropType: '',
        category: 'Vegetables',
        quantity: '',
        unit: 'kg',
        price: '',
        province: '',
        barangay: '',
        harvestDate: '',
        description: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Quick Entry */}
      <div className="mb-6 p-4 bg-[#ECFCCB] rounded-2xl">
        <label className="text-xs font-bold uppercase tracking-widest text-[#4D7C0F] flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          AI Quick Entry (Magkwento lang)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder='Hal: "Mag-aani ako ng 50 kaban ng mais sa Manolo Fortich, Bukidnon sa May 20"'
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
            className="flex-1 bg-white border border-[#E5EAD7] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#4D7C0F] outline-none"
          />
          <button
            type="button"
            onClick={handleAiParse}
            disabled={isAiParsing || !aiDescription.trim()}
            className="px-4 py-2 bg-[#4D7C0F] text-white rounded-xl font-bold text-sm hover:bg-[#3F6212] transition disabled:opacity-50 flex items-center gap-2"
          >
            {isAiParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Auto-fill
          </button>
        </div>
        <p className="text-[10px] text-[#5B6D44] mt-2">
          Pwede Taglish, English, o Filipino. Awtomatikong kukumpletuhin ng AI ang form. Pwede ring mag-mention ng municipality at province.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">Crop Type *</label>
          <input
            type="text"
            value={formData.cropType}
            onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            placeholder="e.g., Rice, Corn, Tomato"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
          >
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains & Rice">Grains & Rice</option>
            <option value="Root Crops">Root Crops</option>
            <option value="Spices">Spices</option>
            <option value="Poultry & Eggs">Poultry & Eggs</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">Quantity *</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="flex-1 px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
              placeholder="Amount"
              required
            />
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-28 px-3 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            >
              <option value="kg">kg</option>
              <option value="sacks">sacks</option>
              <option value="cavan">cavan</option>
              <option value="pieces">pieces</option>
              <option value="bunches">bunches</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Price per {formData.unit} (PHP)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">Province *</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            placeholder="e.g., Bukidnon, Nueva Ecija"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Barangay/Municipality
          </label>
          <input
            type="text"
            value={formData.barangay}
            onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            placeholder="e.g., Manolo Fortich, Brgy. San Jose"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Expected Harvest Date *
          </label>
          <input
            type="date"
            value={formData.harvestDate}
            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">Additional Notes</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            placeholder="Any additional information about your harvest..."
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 bg-[#4D7C0F] text-white rounded-xl font-bold hover:bg-[#3F6212] transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Harvest' : 'Register Harvest')}
        </button>
      </div>
    </form>
  )
}