import { useState, useEffect } from 'react'
import { parseHarvestDescription } from '../lib/gemini'
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react'

interface HarvestFormProps {
  onSuccess: (data: any) => void
  initialData?: any
  isEdit?: boolean
}

const MINDANAO_PROVINCES = [
  "Agusan del Norte", "Agusan del Sur", "Basilan", "Bukidnon", "Camiguin",
  "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental",
  "Davao Oriental", "Dinagat Islands", "Lanao del Norte", "Lanao del Sur",
  "Maguindanao del Norte", "Maguindanao del Sur", "Misamis Occidental", "Misamis Oriental",
  "Sarangani", "South Cotabato", "Sultan Kudarat", "Sulu", "Surigao del Norte",
  "Surigao del Sur", "Tawi-Tawi", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"
].sort();

const MOCK_LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "Bukidnon": {
    "Manolo Fortich": ["San Jose", "Tankulan", "Damilag", "Alae", "Mantibugao"],
    "Malaybalay": ["Casisang", "Sumpong", "Kalasungay", "Aglayan", "Dalwangan"],
    "Valencia": ["Poblacion", "Lumbo", "Batangan", "Bagontaas", "Mailag"]
  },
  "Misamis Oriental": {
    "Cagayan de Oro": ["Carmen", "Lapasan", "Macasandig", "Gusa", "Cugman", "Bulua"],
    "Opol": ["Barra", "Igpit", "Poblacion", "Luyong Bonbon", "Awang"]
  }
};

export default function HarvestForm({ onSuccess, initialData, isEdit }: HarvestFormProps) {
  const [formData, setFormData] = useState({
    cropType: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    price: '',
    province: '',
    municipality: '',
    barangay: '',
    harvestDate: '',
    description: '',
    image: null as File | null
  })

  const [aiDescription, setAiDescription] = useState('')
  const [isAiParsing, setIsAiParsing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [barangays, setBarangays] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData({
        cropType: initialData.cropType || '',
        category: initialData.category || 'Vegetables',
        quantity: initialData.quantity?.toString() || '',
        unit: initialData.unit || 'kg',
        price: initialData.price?.toString() || '',
        province: initialData.province || '',
        municipality: initialData.municipality || '',
        barangay: initialData.barangay || '',
        harvestDate: initialData.harvestDate || '',
        description: initialData.description || '',
        image: null
      })
    }
  }, [initialData])

  useEffect(() => {
    if (formData.province) {
      const provData = MOCK_LOCATION_DATA[formData.province]
      if (provData) {
        setMunicipalities(Object.keys(provData))
      } else {
        setMunicipalities(["City 1", "City 2", "Municipality 1"]) 
      }
    } else {
      setMunicipalities([])
    }
  }, [formData.province])

  useEffect(() => {
    if (formData.province && formData.municipality) {
      const provData = MOCK_LOCATION_DATA[formData.province]
      if (provData && provData[formData.municipality]) {
        setBarangays(provData[formData.municipality])
      } else {
        setBarangays(["Barangay 1", "Barangay 2", "Barangay 3"]) 
      }
    } else {
      setBarangays([])
    }
  }, [formData.province, formData.municipality])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, province: e.target.value, municipality: '', barangay: '' }))
  }

  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, municipality: e.target.value, barangay: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

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
          municipality: parsed.municipality || '',
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
        municipality: '',
        barangay: '',
        harvestDate: '',
        description: '',
        image: null
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
        {/* Image Upload Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">Product Image</label>
          <div className="w-full px-4 py-8 bg-[#FDFCF8] border-2 border-dashed border-[#E5EAD7] rounded-xl flex flex-col items-center justify-center text-[#5B6D44] hover:bg-[#F1F4E8] transition cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="hidden" 
              id="image-upload" 
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-[#4D7C0F]" />
              <span className="font-bold text-sm">
                {formData.image ? formData.image.name : "Click to upload an image"}
              </span>
              <span className="text-xs">PNG, JPG up to 5MB</span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Crop Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cropType}
            onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            placeholder="e.g., Rice, Corn, Tomato"
            required
          />
        </div>

        <div className="md:col-span-2">
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
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
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
            placeholder="0.00"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Province <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.province}
            onChange={handleProvinceChange}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none"
            required
          >
            <option value="" disabled>Select Province</option>
            {MINDANAO_PROVINCES.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Municipality/City <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.municipality}
            onChange={handleMunicipalityChange}
            disabled={!formData.province}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none disabled:opacity-60"
            required
          >
            <option value="" disabled>Select Municipality/City</option>
            {municipalities.map(muni => (
              <option key={muni} value={muni}>{muni}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Barangay <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.barangay}
            onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
            disabled={!formData.municipality}
            className="w-full px-4 py-3 bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl focus:ring-2 focus:ring-[#4D7C0F] outline-none disabled:opacity-60"
            required
          >
            <option value="" disabled>Select Barangay</option>
            {barangays.map(brgy => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1A2E05] mb-2">
            Expected Harvest Date <span className="text-red-500">*</span>
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

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#4D7C0F] text-white rounded-xl font-bold hover:bg-[#3F6212] transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Harvest' : 'Register Harvest')}
        </button>
      </div>
    </form>
  )
}