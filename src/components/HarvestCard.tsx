import { Calendar, MapPin, Package, Clock, ArrowUpRight, Phone, MessageSquare, User as UserIcon, ChevronDown, ChevronUp } from "lucide-react";
import type { Harvest, User } from "../types" 
import { cn } from "../lib/utils" 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HarvestCardProps {
  harvest: Harvest;
  user: User;
  onDelete?: (id: string) => void;
  onEdit?: (harvest: Harvest) => void;
  onViewDetails?: (harvest: Harvest) => void;
  variant?: 'grid' | 'list';
  key?: string | number;
}

export default function HarvestCard({ harvest, user, onDelete, onEdit, onViewDetails, variant = 'grid' }: HarvestCardProps) {
  const isFarmer = user.role === 'farmer';
  const isBuyer = user.role === 'buyer';

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    available: "bg-green-100 text-green-800",
    sold: "bg-blue-100 text-blue-800",
    expired: "bg-red-100 text-red-800",
  };

  if (variant === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl border border-[#E5EAD7] p-4 hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-full md:w-24 h-24 rounded-2xl overflow-hidden bg-[#F1F4E8] shrink-0">
          {harvest.imageUrl ? (
            <img src={harvest.imageUrl} alt={harvest.cropType} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#5B6D44]">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
          <div>
            <p className="text-[10px] font-bold text-[#A16207] uppercase tracking-widest leading-none mb-1">{harvest.cropType}</p>
            <h3 className="text-lg font-black text-[#1A2E05]">{harvest.quantity} {harvest.unit}</h3>
            <p className="text-sm font-bold text-[#4D7C0F]">₱{harvest.pricePerUnit}/{harvest.unit}</p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[#5B6D44]">
              <MapPin className="w-3.5 h-3.5 text-[#4D7C0F]" />
              <span className="text-[11px] font-medium truncate">{harvest.barangay}, {harvest.province}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[#5B6D44]">
              <Calendar className="w-3.5 h-3.5 text-[#4D7C0F]" />
              <span className="text-[11px] font-medium">{new Date(harvest.harvestDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              statusColors[harvest.status as keyof typeof statusColors] || "bg-gray-100"
            )}>
              {harvest.status}
            </div>
          </div>
        </div>

        {isFarmer && (
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(harvest); }}
              className="px-4 py-2 bg-white border border-[#4D7C0F] text-[#4D7C0F] text-xs font-bold rounded-xl hover:bg-[#F1F4E8] transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(harvest.id); }}
              className="px-4 py-2 bg-[#EF4444] text-white text-xs font-bold rounded-xl hover:bg-[#DC2626] transition-all"
            >
              Sold
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
        isBuyer && "cursor-pointer"
      )}
    >
      {/* Top Header with Status and Category */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
          statusColors[harvest.status as keyof typeof statusColors] || "bg-gray-100"
        )}>
          {harvest.status}
        </div>
        {harvest.category && (
          <span className="text-[10px] font-black text-[#4D7C0F] uppercase tracking-widest bg-[#ECFCCB] px-3 py-1 rounded-full">
            {harvest.category}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#A16207] uppercase tracking-widest">
              {harvest.cropType}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-[#1A2E05]">
                {harvest.quantity} {harvest.unit}
              </h3>
              <p className="text-xl font-black text-[#4D7C0F]">₱{harvest.pricePerUnit}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-[#5B6D44]">
              <MapPin className="w-4 h-4 text-[#4D7C0F]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[#4D7C0F]">Location</span>
                <span className="text-xs truncate">{harvest.barangay}, {harvest.province}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#5B6D44]">
              <Calendar className="w-4 h-4 text-[#4D7C0F]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[#4D7C0F]">Target Date</span>
                <span className="text-xs">{new Date(harvest.harvestDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {isFarmer && (
          <div className="space-y-4 pt-4 border-t border-[#F1F4E8]">
            <div className="p-4 bg-[#F1F4E8] rounded-2xl border border-[#E5EAD7] space-y-2">
              <p className="text-xs font-bold text-[#4D7C0F] uppercase tracking-wider">Crop Information</p>
              <p className="text-sm text-[#5B6D44] leading-relaxed line-clamp-2">
                Freshly harvested {harvest.cropType} from {harvest.province}. High quality ensured.
              </p>
            </div>
            
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
                  onDelete?.(harvest.id);
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



