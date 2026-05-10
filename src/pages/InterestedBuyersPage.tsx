import { useState, useMemo } from "react";
import { User } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Phone, MapPin, CheckCircle2, Search, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MOCK_BUYER_LEADS } from "@/mockData";

interface InterestedBuyersPageProps {
  user: User;
}

export default function InterestedBuyersPage({ user }: InterestedBuyersPageProps) {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState(() => 
    MOCK_BUYER_LEADS.filter(b => b.farmerId === user.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.crop.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buyers, searchTerm, statusFilter]);

  const handleDoneOnWay = (id: number) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
  };

  const activeCount = buyers.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[#5B6D44] hover:text-[#4D7C0F] transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-[#1A2E05] tracking-tight">Interested Buyers</h1>
            <p className="text-[#5B6D44] font-medium max-w-xl">
              Manage potential buyers interested in your upcoming harvests. Respond quickly to secure your sales.
            </p>
          </div>
          <div className="bg-[#4D7C0F] text-white px-8 py-4 rounded-3xl shadow-xl shadow-[#4D7C0F]/20 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Active Leads</p>
              <p className="text-3xl font-black leading-none">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 pt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6D44] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by buyer name or crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5EAD7] rounded-3xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#4D7C0F] outline-none shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {['pending', 'completed', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-6 py-2 rounded-2xl font-bold text-sm transition-all border",
                  statusFilter === status 
                    ? "bg-[#1A2E05] text-white border-[#1A2E05]" 
                    : "bg-white text-[#5B6D44] border-[#E5EAD7] hover:border-[#4D7C0F]"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBuyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-white rounded-[40px] border border-[#E5EAD7] p-8 space-y-6 hover:shadow-xl transition-all group flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-[#ECFCCB] rounded-[24px] flex items-center justify-center text-[#4D7C0F] group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  buyer.status === 'pending' ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                )}>
                  {buyer.status}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#5B6D44] uppercase tracking-wider">{buyer.date}</p>
                  <h3 className="text-2xl font-black text-[#1A2E05] leading-tight">{buyer.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#5B6D44] uppercase">Requested Crop</p>
                    <p className="font-bold text-[#4D7C0F]">{buyer.crop}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#5B6D44] uppercase">Quantity</p>
                    <p className="font-bold text-[#1A2E05]">{buyer.quantity}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F1F4E8]">
                  <div className="flex items-center gap-3 text-sm text-[#5B6D44]">
                    <MapPin className="w-4 h-4 text-[#4D7C0F]" />
                    <span className="font-medium">{buyer.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#5B6D44]">
                    <Phone className="w-4 h-4 text-[#4D7C0F]" />
                    <span className="font-black text-[#1A2E05]">{buyer.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {buyer.status === 'pending' && (
              <div className="pt-6">
                <button 
                  onClick={() => handleDoneOnWay(buyer.id)}
                  className="w-full py-4 bg-[#4D7C0F] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#3F6212] transition-all shadow-lg shadow-green-900/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done - On the way
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredBuyers.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/50 border-2 border-dashed border-[#E5EAD7] rounded-[48px] space-y-4">
            <div className="w-24 h-24 bg-[#F1F4E8] rounded-full flex items-center justify-center mx-auto">
              <Filter className="w-10 h-10 text-[#4D7C0F]/20" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-[#1A2E05]">No buyers found</p>
              <p className="text-[#5B6D44]">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


