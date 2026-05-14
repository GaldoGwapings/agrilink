import { cn } from '../lib/utils'
import { X, MapPin, Package, ArrowLeft, Users, Sprout } from "lucide-react";
import type { Harvest } from "../types"

interface ProductDetailsModalProps {
  harvest: Harvest | null;
  onClose: () => void;
}

export default function ProductDetailsModal({ harvest, onClose }: ProductDetailsModalProps) {
  if (!harvest) return null;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    available: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <div
        className="relative w-full max-w-[420px] md:max-w-[420px] bg-white rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
      >
          {/* Header with Back button */}
          <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center pointer-events-none">
            <button 
              onClick={onClose}
              className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[#1A2E05] font-black uppercase tracking-widest text-[9px] shadow-sm hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button 
              onClick={onClose}
              className="pointer-events-auto w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#1A2E05] shadow-sm hover:scale-110 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Section */}
          <div className="h-48 md:h-56 relative shrink-0">
            {harvest.image_url ? (
              <img 
                src={harvest.image_url} 
                alt={harvest.crop_type}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#F1F4E8] flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-[#5B6D44]">
                  <Sprout className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest">No Photos Yet</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-white/80 font-black uppercase tracking-widest text-[9px] bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                {harvest.category}
              </span>
              <h2 className="text-2xl font-black text-white leading-tight">{harvest.crop_type}</h2>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between items-start">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-[#5B6D44] uppercase tracking-wider">Estimated Price</p>
                <p className="text-2xl font-black text-[#1A2E05]">₱{harvest.price_per_unit?.toLocaleString() ?? '0'}<span className="text-[10px] font-bold text-[#5B6D44] ml-0.5">/{harvest.unit}</span></p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                statusColors[harvest.status as keyof typeof statusColors] || "bg-gray-100"
              )}>
                {harvest.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#F1F4E8] rounded-lg flex items-center justify-center text-[#4D7C0F]">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#5B6D44] uppercase leading-none">Quantity</p>
                  <p className="text-xs font-black text-[#1A2E05]">{harvest.quantity} {harvest.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#F1F4E8] rounded-lg flex items-center justify-center text-[#4D7C0F]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#5B6D44] uppercase leading-none">Location</p>
                  <p className="text-xs font-black text-[#1A2E05]">{harvest.province}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FDFCF8] rounded-2xl border border-[#E5EAD7] space-y-1.5">
              <p className="text-[9px] font-black text-[#4D7C0F] uppercase tracking-wider">Description</p>
              <p className="text-[11px] text-[#5B6D44] leading-relaxed">
  {harvest.description || `Freshly harvested ${harvest.crop_type} from ${harvest.province}. High quality.`}
</p>
            </div>

            <div className="p-4 bg-[#ECFCCB]/30 rounded-2xl border border-[#ECFCCB] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-black text-[#1A2E05]">0912-345-6789</p>
                  <p className="text-[9px] font-bold text-[#5B6D44]">Mang Jose's Farm</p>
                </div>
                <Users className="w-4 h-4 text-[#4D7C0F]" />
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-[#1A2E05] text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-lg shadow-black/5"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
  );
}



