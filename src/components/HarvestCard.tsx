import { Calendar, MapPin, Package, ChevronDown } from "lucide-react";
import type { Harvest, User } from "../types"
import { cn } from "../lib/utils"
import { motion } from "framer-motion";

interface HarvestCardProps {
  harvest: Harvest;
  user: User | any; 
  onDelete?: (id: string) => void;
  onEdit?: (harvest: Harvest) => void;
  onSoldOut?: (id: string) => void;
  onViewDetails?: (harvest: Harvest) => void;
  variant?: 'grid' | 'list';  
  key?: string | number;
}

export default function HarvestCard({ harvest, user, onDelete, onEdit, onSoldOut, onViewDetails, variant = 'grid' }: HarvestCardProps) {
  const userRole = user?.user_metadata?.role || user?.role || 'farmer';
  const isFarmer = userRole === 'farmer';
  const isBuyer = userRole === 'buyer';
  
  // If the status is sold, we hide the action buttons to treat it as History.
  const isSold = harvest.status === 'sold';
  
  console.log('Harvest object:', JSON.stringify(harvest, null, 2));

  // Helper functions to handle both camelCase and snake_case property names
  const getCropType = () => {
    return harvest.crop_type || harvest.crop_type || 'Unknown Crop';
  };

  const getHarvestDate = () => {
    const date = harvest.harvest_date || harvest.harvest_date;
    if (!date) return new Date();
    return new Date(date);
  };

  const getPrice = () => {
    const price = harvest.price_per_unit || harvest.price_per_unit || (harvest as any).price;
    return price ? price.toLocaleString() : '0';
  };

  const getUnit = () => {
    return harvest.unit || 'kg';
  };

  const getQuantity = () => {
    return harvest.quantity || 0;
  };

  const getCategory = () => {
    return harvest.category || '';
  };

  const getProvince = () => {
    return harvest.province || '';
  };

  const getBarangay = () => {
    return harvest.barangay || '';
  };

  const getDescription = () => {
    return harvest.description || `Freshly harvested ${getCropType()} from ${getProvince()}. High quality ensured.`;
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    available: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-800",
    expired: "bg-red-100 text-red-800",
  };

  const rawImage = (harvest as any).image || (harvest as any).imageUrl || harvest.image_url;
  const displayImage = rawImage instanceof File ? URL.createObjectURL(rawImage) : rawImage;

  // Format date for display
  const formatDate = (date: Date) => {
    if (isNaN(date.getTime())) return 'Date TBD';
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (variant === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl border border-[#E5EAD7] p-4 hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-full md:w-24 h-24 rounded-2xl overflow-hidden bg-[#F1F4E8] shrink-0">
          {displayImage ? (
            <img src={displayImage} alt={getCropType()} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#5B6D44]">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
          <div>
            <p className="text-[10px] font-bold text-[#A16207] uppercase tracking-widest leading-none mb-1">{getCropType()}</p>
            <h3 className="text-lg font-black text-[#1A2E05]">{getQuantity()} {getUnit()}</h3>
            <p className="text-sm font-bold text-[#4D7C0F]">₱{getPrice()}/{getUnit()}</p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[#5B6D44]">
              <MapPin className="w-3.5 h-3.5 text-[#4D7C0F]" />
              <span className="text-[11px] font-medium truncate">{getBarangay()}, {getProvince()}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[#5B6D44]">
              <Calendar className="w-3.5 h-3.5 text-[#4D7C0F]" />
              <span className="text-[11px] font-medium">{formatDate(getHarvestDate())}</span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              statusColors[harvest.status as keyof typeof statusColors] || "bg-green-100 text-green-800"
            )}>
              {harvest.status || "available"}
            </div>
          </div>
        </div>

        {isFarmer && !isSold && (
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(harvest); }}
              className="px-4 py-2 bg-white border border-[#4D7C0F] text-[#4D7C0F] text-xs font-bold rounded-xl hover:bg-[#F1F4E8] transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onSoldOut?.(harvest.id); }}
              className="px-4 py-2 bg-[#EF4444] text-white text-xs font-bold rounded-xl hover:bg-[#DC2626] transition-all"
            >
              Sold Out
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  // Default Grid Layout
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => isBuyer && onViewDetails?.(harvest)}
      className={cn(
        "group bg-white rounded-[32px] border border-[#E5EAD7] p-6 hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full",
        isBuyer && "cursor-pointer",
        isSold && "opacity-80 hover:opacity-100"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
          statusColors[harvest.status as keyof typeof statusColors] || "bg-green-100 text-green-800"
        )}>
          {harvest.status || "available"}
        </div>
        {getCategory() && (
          <span className="text-[10px] font-black text-[#4D7C0F] uppercase tracking-widest bg-[#ECFCCB] px-3 py-1 rounded-full">
            {getCategory()}
          </span>
        )}
      </div>

      <div className="w-full h-44 bg-[#F1F4E8] rounded-2xl mb-6 relative overflow-hidden shrink-0 border border-[#E5EAD7]">
        {displayImage ? (
          <img src={displayImage} alt={getCropType()} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5B6D44]">
            <Package className="w-12 h-12" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#A16207] uppercase tracking-widest">
              {getCropType()}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-[#1A2E05]">
                {getQuantity()} {getUnit()}
              </h3>
              <p className="text-xl font-black text-[#4D7C0F]">₱{getPrice()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-[#5B6D44]">
              <MapPin className="w-4 h-4 text-[#4D7C0F]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[#4D7C0F]">Location</span>
                <span className="text-xs truncate">{getBarangay()}, {getProvince()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#5B6D44]">
              <Calendar className="w-4 h-4 text-[#4D7C0F]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[#4D7C0F]">Target Date</span>
                <span className="text-xs">{formatDate(getHarvestDate())}</span>
              </div>
            </div>
          </div>

          {/* Price display in crop information */}
          <div className="p-4 bg-[#F1F4E8] rounded-2xl border border-[#E5EAD7] space-y-2">
            <p className="text-xs font-bold text-[#4D7C0F] uppercase tracking-wider">Crop Information</p>
            {Number(getPrice()) > 0 && (
              <p className="text-sm font-bold text-[#1A2E05]">
                Price: ₱{getPrice()} per {getUnit()}
              </p>
            )}
            
            <p className="text-sm text-[#5B6D44] leading-relaxed line-clamp-2">
              {getDescription()}
            </p>
          </div>
        </div>

        {isFarmer && !isSold && (
          <div className="space-y-4 pt-4 border-t border-[#F1F4E8]">
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(harvest);
                }}
                className="flex-1 py-3 bg-white border border-[#4D7C0F] text-[#4D7C0F] text-sm font-bold rounded-2xl hover:bg-[#F1F4E8] transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSoldOut?.(harvest.id); 
                }}
                className="flex-1 py-3 bg-[#EF4444] text-white text-sm font-bold rounded-2xl hover:bg-[#DC2626] transition-colors shadow-lg shadow-red-500/10"
              >
                Sold Out
              </button>
            </div>
          </div>
        )}

        {isBuyer && (
          <div className="pt-4 border-t border-[#F1F4E8]">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-[#4D7C0F] uppercase tracking-widest transition-all">
              Click for Details <ChevronDown className="w-3 h-3 group-hover:animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}