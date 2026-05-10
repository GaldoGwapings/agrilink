import { useState } from "react";
import type { Harvest } from "../types"
import { MOCK_HARVESTS } from "@/mockData";
import HarvestCard from "@/components/HarvestCard";
import { Search, Map as MapIcon, Filter, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import ProductDetailsModal from "../components/ProductDetailsModal";

interface BuyerDashboardProps {
  user: User;
}

export default function BuyerDashboard({ user }: BuyerDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);

  const filteredHarvests = MOCK_HARVESTS.filter(h => {
    const matchesSearch = h.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === "All" || h.province === filterRegion;
    const matchesCategory = filterCategory === "All" || h.category === filterCategory;
    return matchesSearch && matchesRegion && matchesCategory;
  });

  const regions = ["All", "Bukidnon", "Pangasinan", "Nueva Ecija", "South Cotabato"];
  const categories = ["All", "Vegetables", "Fruits", "Grains & Rice", "Root Crops", "Spices", "Poultry & Eggs"];

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#A16207] uppercase tracking-widest">Marketplace</p>
          <h1 className="text-4xl font-black text-[#1A2E05]">Discover Upcoming Harvests</h1>
          <p className="text-[#5B6D44]">Connect with verified farmers and secure your supply in advance.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search crops (e.g. Corn, Rice, Onion)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5EAD7] rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none shadow-sm transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group min-w-[160px]">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none w-full bg-white border border-[#E5EAD7] rounded-2xl pl-6 pr-10 py-4 font-bold text-sm focus:ring-2 focus:ring-[#4D7C0F] outline-none shadow-sm cursor-pointer transition-all hover:border-[#4D7C0F]"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5B6D44] group-hover:text-[#4D7C0F] transition-colors">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <div className="relative group min-w-[160px]">
              <select 
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="appearance-none w-full bg-white border border-[#E5EAD7] rounded-2xl pl-6 pr-10 py-4 font-bold text-sm focus:ring-2 focus:ring-[#4D7C0F] outline-none shadow-sm cursor-pointer transition-all hover:border-[#4D7C0F]"
              >
                {regions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5B6D44] group-hover:text-[#4D7C0F] transition-colors">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredHarvests.map((h) => (
          <HarvestCard 
            key={h.id} 
            harvest={h} 
            user={user} 
            onViewDetails={(harvest) => setSelectedHarvest(harvest)}
          />
        ))}
      </section>

      <ProductDetailsModal 
        harvest={selectedHarvest} 
        onClose={() => setSelectedHarvest(null)} 
      />
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <Search className={className} />
  );
}


