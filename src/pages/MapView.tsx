// MapView.tsx - Updated with Supabase integration
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Sprout, Filter, Navigation, ChevronDown, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Harvest {
  id: string;
  crop_type: string;
  category: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  province: string;
  barangay: string;
  price_per_unit: number;
  lat: number;
  lng: number;
  status: string;
}

interface MapViewProps {
  user?: any;
}

export default function MapView({ user }: MapViewProps) {
  const [filter, setFilter] = useState('All');
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ["All", "Vegetables", "Fruits", "Grains & Rice", "Root Crops", "Spices", "Poultry & Eggs"];
  
  // Fetch harvests from Supabase
  useEffect(() => {
    const fetchHarvests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('harvests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHarvests(data as Harvest[]);
      }
      setLoading(false);
    };

    fetchHarvests();

    // Real-time subscription for harvest changes
    const subscription = supabase
      .channel('harvests_map_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'harvests' },
        () => {
          fetchHarvests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const filteredHarvests = harvests.filter(h => 
    filter === 'All' || h.category === filter
  );

  return (
    <>
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-8 lg:px-16 h-[calc(100vh-12rem)] flex flex-col gap-6 py-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#15803D] uppercase tracking-widest">Regional Logistics</p>
            <h1 className="text-4xl font-black text-[#1A2E05]">Interactive Harvest Map</h1>
            <p className="text-[#5B6D44]">Find available produce and optimize your transport routes.</p>
          </div>

          <div className="relative group w-full md:w-44">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4D7C0F]">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#F1F4E8] border border-[#E5EAD7] rounded-xl outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all font-bold text-[#1A2E05] text-xs appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6D44] pointer-events-none">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        <div className="flex-1 relative rounded-[32px] overflow-hidden border border-[#E5EAD7] shadow-xl">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-[#4D7C0F] animate-spin mx-auto mb-3" />
                <p className="text-[#5B6D44] text-sm">Loading map data...</p>
              </div>
            </div>
          ) : (
            <MapContainer 
              center={[12.8797, 121.7740]} 
              zoom={6} 
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredHarvests.map((h) => (
                <Marker key={h.id} position={[h.lat, h.lng]}>
                  <Popup>
                    <div className="p-4 min-w-[200px] space-y-3">
                      <div>
                        <span className="px-2 py-0.5 bg-[#FEF9C3] text-[#A16207] text-[8px] font-black uppercase rounded-full tracking-wider">
                          {h.category}
                        </span>
                        <p className="text-[10px] font-bold text-[#5B6D44] uppercase tracking-widest leading-none mt-1">{h.crop_type}</p>
                        <h4 className="font-black text-[#1A2E05] text-lg">{h.quantity} {h.unit}</h4>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-[#5B6D44]">
                          <MapPin className="w-3 h-3" />
                          {h.barangay}, {h.province}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#5B6D44]">
                          <Sprout className="w-3 h-3" />
                          Harvesting {new Date(h.harvest_date).toLocaleDateString('en-PH')}
                        </div>
                      </div>
                      <button className="w-full py-2 bg-[#4D7C0F] text-white text-xs font-bold rounded-lg hover:bg-[#3F6212] transition-colors flex items-center justify-center gap-1">
                        <Navigation className="w-3 h-3" />
                        Get Best Route
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E5EAD7] shadow-lg space-y-3 hidden md:block">
            <p className="text-xs font-bold text-[#1A2E05] uppercase tracking-wider">Map Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-[11px] text-[#5B6D44]">Active Listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                <span className="text-[11px] text-[#5B6D44]">Pending Harvest</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E5EAD7]">
              <p className="text-[10px] text-[#5B6D44] italic">Real-time data from farmers</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}