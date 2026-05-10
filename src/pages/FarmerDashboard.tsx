import { useState } from "react";
import type { User, Harvest } from '../types'
import { MOCK_HARVESTS } from '../mockData'
import HarvestCard from '../components/HarvestCard'
import HarvestForm from '../components/HarvestForm' 
import { Plus, LayoutGrid, List, Sun, Cloud, CloudRain, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '../lib/utils'

interface FarmerDashboardProps {
  user: any;
}

export default function FarmerDashboard({ user }: FarmerDashboardProps) {
  const [harvests, setHarvests] = useState<Harvest[]>(
    MOCK_HARVESTS.filter(h => h.province === user.region)
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [viewState, setViewState] = useState<'grid' | 'list'>('grid');

  const handleDeleteHarvest = (id: string) => {
    setHarvests(harvests.filter(h => h.id !== id));
  };

  const weatherForecast = [
    { day: "Today", temp: "31°C", condition: "Sunny", icon: Sun },
    { day: "Tomorrow", temp: "29°C", condition: "Cloudy", icon: Cloud },
    { day: "Monday", temp: "28°C", condition: "Rainy", icon: CloudRain },
    { day: "Tuesday", temp: "30°C", condition: "Sunny", icon: Sun },
  ];

  const handleAddHarvest = (newHarvest: Partial<Harvest>) => {
    if (editingHarvest) {
      // Update existing harvest
      setHarvests(harvests.map(h => h.id === editingHarvest.id ? { ...h, ...newHarvest } as Harvest : h));
      setEditingHarvest(null);
      setShowAddForm(false);
    } else {
      // Add new harvest
      const fullHarvest: Harvest = {
        ...newHarvest as Harvest,
        id: `h-${Date.now()}`,
        farmerId: user.id,
        lat: 8.2917, // Mocking random lat
        lng: 124.9667, // Mocking random lng
      };
      setHarvests([fullHarvest, ...harvests]);
      setShowAddForm(false);
    }
  };

  const handleEditHarvest = (harvest: Harvest) => {
    setEditingHarvest(harvest);
    setShowAddForm(true);
    // Scroll to top or form position
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#4D7C0F] uppercase tracking-widest">Farmer Portal</p>
          <h1 className="text-4xl font-black text-[#1A2E05]">My Harvest Portal</h1>
          <p className="text-[#5B6D44]">Region: {user.region}, Philippines</p>
        </div>

        <button 
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingHarvest(null);
            } else {
              setShowAddForm(true);
            }
          }}
          className={cn(
            "px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95",
            showAddForm 
              ? "bg-[#1A2E05] text-white" 
              : "bg-[#4D7C0F] text-white hover:bg-[#3F6212] shadow-[#4D7C0F]/20"
          )}
        >
          {showAddForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> New Harvest</>}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.div
            key={editingHarvest ? editingHarvest.id : 'add-form'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] border-2 border-[#4D7C0F]/10 p-8 shadow-2xl relative overflow-hidden"
          >
            <HarvestForm 
              onSuccess={handleAddHarvest} 
              initialData={editingHarvest || undefined} 
              isEdit={!!editingHarvest}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-[#E5EAD7] pb-4">
          <h2 className="text-2xl font-black text-[#1A2E05]">My Active Harvests</h2>
          
          <div className="flex items-center bg-[#F1F4E8] p-1 rounded-xl">
            <button 
              onClick={() => setViewState('grid')}
              className={cn("p-2 rounded-lg transition-all", viewState === 'grid' ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewState('list')}
              className={cn("p-2 rounded-lg transition-all", viewState === 'list' ? "bg-white text-[#4D7C0F] shadow-sm" : "text-[#5B6D44]")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {harvests.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewState === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {harvests.map((h) => (
              <HarvestCard 
                key={h.id} 
                harvest={h} 
                user={user} 
                variant={viewState}
                onDelete={handleDeleteHarvest}
                onEdit={handleEditHarvest}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-white border-2 border-dashed border-[#E5EAD7] rounded-3xl">
            <div className="w-20 h-20 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-10 h-10 text-[#4D7C0F]/40" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-[#1A2E05]">No active listings found</p>
              <p className="text-sm text-[#5B6D44]">Start by adding your information about coming harvest.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


