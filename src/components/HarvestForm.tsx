import { useState, useEffect } from 'react'
import { parseHarvestDescription } from '../lib/gemini'
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

// Complete location data for Mindanao
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "Agusan del Norte": {
    "Butuan City": ["Ambago", "Baan", "Bading", "Bancasi", "Bayugan 3", "Bilay", "Bit-os", "Bobon", "Bonbon", "Buenavista", "Cabungahan", "California", "Camayahan", "Dagohoy", "De Oro", "Doongan", "Golden Ribbon", "Holy Redeemer", "Humabon", "Imadejas", "Kinamlutan", "Lapu-lapu", "Lomboyan", "Los Angeles", "Maibu", "Manapa", "Pagatpatan", "Pangabutan", "Pianing", "Pinamanculan", "Port Poyohon", "Purok 2", "San Ignacio", "San Mateo", "San Vincente", "Sanghan", "Santa Ana", "Sumilihon", "Tagabaca", "Taguibo", "Taligaman"],
    "Cabadbaran City": ["Baylinan", "Cahayagan", "Calibunan", "Comagascas", "Del Pilar", "Jose Rizal", "Lorenzo", "Mahaba", "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4", "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8", "Poblacion 9", "Poblacion 10", "Poblacion 11", "Sanghan", "Tongonan"]
  },
  "Agusan del Sur": {
    "Bayugan City": ["Calaitan", "Charity", "Gabut", "Malaga", "Mabuhay", "Maygatasan", "Noli", "Poblacion", "Salvacion", "Sapinit", "Taglatawan", "Tungao", "Verdu"],
    "Prosperidad": ["Awa", "Azpetia", "Borbon", "Causwagan", "La Caridad", "Langag", "Magdallao", "Patin-ay", "Poblacion", "Salvacion", "San Jose", "Santa Cruz", "Sibagat", "Tudela"]
  },
  "Basilan": {
    "Isabela City": ["Aguada", "Binuangan", "Busay", "Cabunbata", "Calunasan", "Carbon", "Diki", "La Piedad", "Lantawan", "Little Baguio", "Malamawi", "Maligue", "Marcos", "Masula", "Menzi", "Panigayan", "Port Area", "Sumagdang", "Sunrise"],
    "Lamitan City": ["Bagong Parang", "Balas", "Bohebessey", "Boheyakan", "Bulingan", "Limook", "Malakal", "Maligay", "Matibay", "Poblacion", "Sabar", "Santo Niño", "Ubit", "Upper Candis"]
  },
  "Bukidnon": {
    "Malaybalay City": ["Aglayan", "Bangcud", "Busdi", "Cabangahan", "Caburacanan", "Can-ayan", "Capinonan", "Casisang", "Dalwangan", "Imbayao", "Indalaza", "Kalasungay", "Kibalabag", "Linabo", "Magsaysay", "Maligaya", "Managok", "Mapayag", "Patpat", "Saint Peter", "San Jose", "San Martin", "Santo Niño", "Silae", "Simaya", "Sinanglanan", "Sumpong", "Tamburong", "Tumpagon", "Zamora"],
    "Valencia City": ["Bagontaas", "Batangan", "Catumbalon", "Colonia", "Concepcion", "Guinoyuran", "Kahaponan", "Laligan", "Lilingayon", "Lumbo", "Lurugan", "Mailag", "Maapag", "Poblacion", "Pulot", "San Carlos", "San Isidro", "Sinabuagan", "Sugod", "Tongantongan", "Tugaya"],
    "Manolo Fortich": ["Agusan Canyon", "Alae", "Dahilayan", "Dalirig", "Kisolon", "Lindaban", "Lunocan", "Mantibugao", "Minsuro", "San Miguel", "Sankanan", "Santiago", "Tankulan", "Ticalaan", "Upper Alae"],
    "Quezon": ["Butong", "Cebole", "Delapa", "Kiburiao", "Kipayong", "Kitaob", "Lica", "Lipa", "Mabuhay", "Magsaysay", "Mibalagon", "Poblacion", "Salawagan", "San Jose", "Santa Ana", "Santa Cruz", "Simod", "Sinuda", "Sugod", "Tawas", "Tulugan"],
    "Impasugong": ["Bontongan", "Bulao", "Capitan Bayong", "Cawayan", "Dumalaguing", "Kabasalan", "Kalabugao", "Kibalagon", "La Fortuna", "Pigsalohan", "Poblacion", "Sayawan", "Umalag"]
  },
  "Camiguin": {
    "Mambajao": ["Agoho", "Anito", "Baylao", "Benhaan", "Bokbok", "Bonbon", "Catadman", "Naasag", "Poblacion", "Sagay", "Soro-soro", "Tupsan", "Yumbing"]
  },
  "Cotabato": {
    "Kidapawan City": ["Amas", "Batang", "Binoligan", "Calabawan", "Junction", "Lanao", "Lanao Kuring", "Mabuhay", "Meocan", "Mua-an", "Natalungan", "Poblacion", "Sibawan", "Singao", "Sudapin", "Tanayon", "Tibangao"],
    "M'lang": ["Agkuhon", "Bagontapay", "Bucana", "Dagupan", "J.P. Rizal", "Magsaysay", "New Antique", "New Esperanza", "New Calinog", "Pulang Lupa", "Poblacion A", "Poblacion B", "Rosary Heights", "San Miguel", "Tawan-tawan"]
  },
  "Davao de Oro": {
    "Nabunturan": ["Anislagan", "Antipolo", "Bayabas", "Bukal", "Cabidianan", "Canabuang", "Lungsodaan", "Mabuhay", "Magading", "Mawab", "New Sibonga", "Poblacion", "San Antonio", "San Isidro", "San Jose", "San Miguel", "San Pedro", "San Vicente", "Tagnanan", "Upi"]
  },
  "Davao del Norte": {
    "Tagum City": ["Apokon", "Bincungan", "Busaon", "Canocotan", "Cuambogan", "La Filipina", "Liboganon", "Madaum", "Magdum", "Mankilam", "New Balamban", "Pagsabangan", "Pandapan", "Poblacion", "San Agustin", "San Isidro", "San Jose", "San Miguel", "San Rafael", "Santa Cruz", "Visayan Village"],
    "Panabo City": ["Cagangohan", "Consolacion", "Datu Abdul Dadia", "Gredu", "J.P. Laurel", "Kasilak", "Katipunan", "Ligtong", "Lower Panaga", "Magugpo", "Manay", "Nanyo", "Poblacion", "San Francisco", "San Nicolas", "San Roque", "San Vicente", "Santa Cruz", "Tibungol", "Upper Panaga"]
  },
  "Davao del Sur": {
    "Digos City": ["Aplaya", "Balabag", "Bincungan", "Bacungan", "Binuangan", "Cogon", "Dawis", "Goma", "Igpit", "Kiagot", "Lungao", "Mabilog", "Malabog", "Matti", "Ruparan", "Santa Cruz", "San Isidro", "San Jose", "San Miguel", "San Vicente", "Zone 1", "Zone 2", "Zone 3"],
    "Davao City": ["Agdao", "Buhangin", "Bunawan", "Calinan", "Catalunan Grande", "Catalunan Pequeño", "Lapu-Lapu", "Ma-a", "Maa", "Magugpo", "Mandug", "Matina", "Poblacion", "Sasa", "Talomo", "Toril", "Tugbok"]
  },
  "Davao Oriental": {
    "Mati City": ["Badas", "Bobon", "Buhangin", "Cabuaya", "Central", "Cuambog", "Dahican", "Datu Lupon", "Don Salvador Lopez", "Javier", "Lawigan", "Macambol", "Mangga", "Marayag", "Poblacion", "Sambulawan", "San Antonio", "San Isidro", "Santo Niño", "Tagabakid", "Tagbinonga"]
  },
  "Lanao del Norte": {
    "Iligan City": ["Abuno", "Acmar", "Bagong Silang", "Bonbonon", "Bunawan", "Bur-u-an", "Del Carmen", "Hinaplanon", "Luinab", "Mahayahay", "Maria Cristina", "Pala-o", "Poblacion", "San Miguel", "Santiago", "Santa Elena", "Santa Filomena", "Suarez", "Tambo", "Tibanga", "Tipanoy", "Tubod"],
    "Tubod": ["Barakanas", "Baroy", "Barra", "Bualan", "Candelaria", "Diaz", "Lala", "Magsaysay", "Poblacion", "Sagadan", "Sultan Naga Dimaporo", "Tangcal"]
  },
  "Lanao del Sur": {
    "Marawi City": ["Ambolong", "Bangon", "Bito Buadi", "Bito Itom", "Bongabong", "Bubuya", "Buadi Sacayo", "Cabingan", "Calocan", "Dansalan", "Datu Sa Dansalan", "Dilimbayan", "Emie", "Gadungan", "Guiting", "Kapatagan", "Kilala", "Lucing", "Mamaanun", "Mangondato", "Marawi Poblacion", "Matampay", "Mipaga", "Moncado", "Naroon", "Raya Saduc", "Sabala Manoc", "Sabala Ranirun", "Saber", "Sagonsongan", "Somioray", "Sugod", "Tolali", "Toros", "Wawalayan"]
  },
  "Misamis Occidental": {
    "Ozamiz City": ["Agusan", "Bacolod", "Bagakay", "Balintawak", "Banadero", "Bañadero", "Barra", "Cabanbanan", "Carangan", "Catadman", "Cogon", "Dimalinao", "Doña Consuelo", "Embargo", "Gala", "Gango", "Guimad", "Kabasalan", "Labo", "Lam-an", "Lapasan", "Lingohoy", "Malaubang", "Manabay", "Mantic", "Mulat", "Poblacion", "Pulot", "San Antonio", "San Jose", "San Roque", "Sangay", "Santo Niño", "Siap", "Tabid", "Talisay", "Tuburan"],
    "Oroquieta City": ["Binuangan", "Bolibol", "Buenavista", "Calamba", "Cruz", "Dullan", "Laya", "Lower Lamac", "Mobod", "Poblacion", "Punta", "San Vicente", "Sibucal", "Taytay", "Tolindog", "Upper Lamac"]
  },
  "Misamis Oriental": {
    "Cagayan de Oro City": ["Balulang", "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40", "Camaman-an", "Carmen", "Consolacion", "Kauswagan", "Lapasan", "Lumbia", "Macabalan", "Macasandig", "Nazareth", "Patag", "Puerto", "San Simon"],
    "Gingoog City": ["Agay-ayan", "Bag-ong Bukid", "Binanwagan", "Camanse", "Eureka", "Kalipay", "Kilabra", "Lantad", "Lunotan", "Mabuhay", "Minalwang", "Odiongan", "Poblacion", "Sulbogon", "Tacuron"]
  },
  "Sarangani": {
    "General Santos City": ["Apopong", "Baluan", "Bula", "Calumpang", "City Heights", "Conel", "Dadiangas", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West", "Fatima", "Labangal", "Lagtang", "Ligaya", "Lomang", "Lumbia", "Mabuhay", "Olympog", "Okiot", "Purok Malakas", "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler", "Upper Labay"]
  },
  "South Cotabato": {
    "Koronadal City": ["Barrio 1", "Barrio 2", "Barrio 3", "Barrio 4", "Barrio 5", "Barrio 6", "Barrio 7", "Barrio 8", "Barrio 9", "Barrio 10", "General Paulino Santos", "Marbel", "Marbel 1", "Marbel 2", "Marbel 3", "Marbel 4", "Marbel 5", "Marbel 6", "Marbel 7", "Marbel 8", "Marbel 9", "Marbel 10", "Morales", "Santo Niño", "San Jose", "San Roque", "Zone 1", "Zone 2", "Zone 3", "Zone 4"],
    "Tupi": ["Acmonan", "Banga", "Buntogon", "Cabuling", "Cafel", "Carpenter Hill", "Koronadal Proper", "Lambayong", "Linan", "Lunen", "Miasong", "Palencia", "Poblacion", "Polonuling", "Tupi Proper"]
  },
  "Sultan Kudarat": {
    "Tacurong City": ["Baras", "Buenavista", "Calean", "D'Ledesma", "Kalandagan", "Lancheta", "New Carmen", "New Isabela", "Poblacion", "Rajah Muda", "San Antonio", "San Emmanuel", "San Pablo", "San Rafael", "Tina"]
  },
  "Sulu": {
    "Jolo": ["Alat", "Asturias", "Bus-bus", "Chinese Pier", "San Raymundo", "Takut-Takut", "Tulay", "Walled City"]
  },
  "Surigao del Norte": {
    "Surigao City": ["Bonifacio", "Cabarasan", "Calibunan", "Canlanipa", "Lipata", "Luna", "Mabua", "Maharlika", "Magsaysay", "Manila", "Navarro", "Poblacion", "Rizal", "Sabang", "San Jose", "San Juan", "San Pedro", "San Roque", "Serna", "Taft"]
  },
  "Surigao del Sur": {
    "Tandag City": ["Awasian", "Bagong Lungsod", "Bongtud", "Consuelo", "Dagocdoc", "Lico", "Mabua", "Maitum", "San Agustin Norte", "San Agustin Sur", "San Jose", "San Miguel", "San Vicente", "Telaje", "Tudela"]
  },
  "Zamboanga del Norte": {
    "Dipolog City": ["Barra", "Biasong", "Central", "Cogon", "Diwan", "Estaka", "Galas", "Gulayon", "Loyola", "Magsaysay", "Miputak", "Olingan", "Poblacion", "Sicayab", "Sinanlay", "Sta. Isabel", "Sta. Maria", "Tambang", "Tavvog"]
  },
  "Zamboanga del Sur": {
    "Pagadian City": ["Buenavista", "Bulatok", "Dagunan", "Danlugan", "Gatas", "Kawit", "Lapaz", "Lumbia", "Malalang", "Poblacion", "San Francisco", "San Jose", "San Pedro", "Santa Lucia", "Santiago", "Santo Niño", "Tawagan Sur", "Tiguma", "Tuburan"],
    "Zamboanga City": ["Ayala", "Baliwasan", "Calarian", "Camino Nuevo", "Canelar", "Cawit", "Cuarta", "Dulian", "Guiwan", "Labuan", "Limpapa", "Maasin", "Manicahan", "Mercedes", "Pasonanca", "Puti", "Recodo", "San Jose Gusu", "San Jose Cawa-Cawa", "San Roque", "Santa Catalina", "Santa Maria", "Santo Niño", "Taluksangay", "Tetuan", "Tugbungan", "Tumaga", "Vitali", "Zona"]
  }
};

export default function HarvestForm({ onSuccess, initialData, isEdit }: HarvestFormProps) {
  const [formData, setFormData] = useState({
    crop_type: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    province: '',
    municipality: '',
    barangay: '',
    harvest_date: '',
    description: '',
    image: null as File | null,
    status: 'active'
  })

  const [aiDescription, setAiDescription] = useState('')
  const [isAiParsing, setIsAiParsing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [barangays, setBarangays] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      let formattedDate = initialData.harvest_date || initialData.harvestDate || ''
      if (formattedDate && formattedDate.includes('/')) {
        const parts = formattedDate.split('/')
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
        }
      }
      
      setFormData({
        crop_type: initialData.crop_type || initialData.cropType || '',
        category: initialData.category || 'Vegetables',
        quantity: initialData.quantity?.toString() || '',
        unit: initialData.unit || 'kg',
        price_per_unit: (initialData.price_per_unit || initialData.pricePerUnit || initialData.price || '').toString(),
        province: initialData.province || '',
        municipality: initialData.municipality || '',
        barangay: initialData.barangay || '',
        harvest_date: formattedDate,
        description: initialData.description || '',
        image: null,
        status: initialData.status || 'active'
      })
    }
  }, [initialData])

  useEffect(() => {
    if (formData.province) {
      const provData = LOCATION_DATA[formData.province]
      if (provData) {
        setMunicipalities(Object.keys(provData).sort())
      } else {
        setMunicipalities([])
      }
    } else {
      setMunicipalities([])
    }
  }, [formData.province])

  useEffect(() => {
    if (formData.province && formData.municipality) {
      const provData = LOCATION_DATA[formData.province]
      if (provData && provData[formData.municipality]) {
        setBarangays(provData[formData.municipality].sort())
      } else {
        setBarangays([])
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
        let formattedDate = parsed.targetDate || ''
        if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dateObj = new Date(formattedDate)
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0]
          }
        }
        
        setFormData(prev => ({
          ...prev,
          crop_type: parsed.cropName,
          category: parsed.category,
          quantity: parsed.quantity.toString(),
          unit: parsed.unit,
          price_per_unit: parsed.price.toString(),
          province: parsed.province,
          municipality: parsed.municipality || '',
          barangay: parsed.barangay || '',
          harvest_date: formattedDate
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
    
    let formattedDate = formData.harvest_date
    if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dateObj = new Date(formattedDate)
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0]
      }
    }
    
    if (!formattedDate) {
      formattedDate = new Date().toISOString().split('T')[0]
    }
    
    onSuccess({
      crop_type: formData.crop_type,
      category: formData.category,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit,
      price_per_unit: parseFloat(formData.price_per_unit) || 0,
      province: formData.province,
      municipality: formData.municipality,
      barangay: formData.barangay,
      harvest_date: formattedDate,
      description: formData.description,
      image: formData.image,
      status: formData.status
    })
    
    setLoading(false)
    
    if (!isEdit) {
      setFormData({
        crop_type: '',
        category: 'Vegetables',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        province: '',
        municipality: '',
        barangay: '',
        harvest_date: '',
        description: '',
        image: null,
        status: 'active'
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
            value={formData.crop_type}
            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
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
            step="0.01"
            value={formData.price_per_unit}
            onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
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
            value={formData.harvest_date}
            onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
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