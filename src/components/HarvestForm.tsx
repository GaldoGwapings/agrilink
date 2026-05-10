import { useState, FormEvent, useRef, ChangeEvent } from "react";
import { Sparkles, Loader2, Plus, Info, Upload, Image as ImageIcon, X } from "lucide-react";
import { parseHarvestDescription } from "@/services/gemini";
import type { Harvest } from "../types"
import { cn } from "@/lib/utils";

interface HarvestFormProps {
  onSuccess: (harvest: Partial<Harvest>) => void;
  initialData?: Harvest;
  isEdit?: boolean;
}

export default function HarvestForm({ onSuccess, initialData, isEdit }: HarvestFormProps) {
  const [description, setDescription] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [showManual, setShowManual] = useState(isEdit || false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
    cropType: initialData?.cropType || "",
    category: initialData?.category || "Vegetables",
    quantity: initialData?.quantity?.toString() || "",
    unit: initialData?.unit || "kg",
    pricePerUnit: initialData?.pricePerUnit?.toString() || "",
    harvestDate: initialData?.harvestDate || "",
    barangay: initialData?.barangay || "",
    province: initialData?.province || "Bukidnon",
  });

  const handleAIParse = async () => {
    if (!description.trim()) return;
    setIsParsing(true);
    const result = await parseHarvestDescription(description);
    setIsParsing(false);
    
    if (result) {
      setFormData({
        ...formData,
        cropType: result.cropType,
        quantity: result.quantity.toString(),
        unit: result.unit,
        category: result.category || "Vegetables",
        pricePerUnit: result.pricePerUnit?.toString() || "",
        harvestDate: result.harvestDate,
        barangay: result.location,
      });
      setShowManual(true);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Strict validation for barangay
    if (!formData.barangay.trim()) {
      alert("Please provide the Barangay for your harvest location.");
      return;
    }

    onSuccess({
      ...initialData,
      cropType: formData.cropType,
      category: formData.category as any,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      pricePerUnit: parseFloat(formData.pricePerUnit) || 0,
      imageUrl: imagePreview || undefined,
      harvestDate: formData.harvestDate,
      barangay: formData.barangay,
      province: formData.province,
      status: initialData?.status || 'pending',
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });

    // Reset form after success
    setImagePreview(null);
  };

  return (
    <div className={cn(
      "bg-white rounded-[32px] border border-[#E5EAD7] p-8 space-y-8",
      isEdit && "border-none p-0 bg-transparent shadow-none"
    )}>
      {!isEdit && (
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#A16207]" />
            Smart Listing
          </h3>
          <p className="text-sm text-[#5B6D44]">
            Type naturally in Taglish or English. Our AI will extract the details for you.
          </p>
        </div>
      )}

      {!isEdit && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='e.g., "Mayroon akong 20 sako ng puting mais sa Sumilao, Bukidnon sa susunod na linggo"'
              className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl p-4 pr-12 h-32 focus:ring-2 focus:ring-[#4D7C0F] outline-none transition-all"
            />
            <button
              onClick={handleAIParse}
              disabled={isParsing || !description.trim()}
              className="absolute bottom-4 right-4 p-3 bg-[#1A2E05] text-white rounded-xl hover:bg-[#4D7C0F] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
            >
              {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Parse Data
            </button>
          </div>

          {!showManual && (
            <button 
              onClick={() => setShowManual(true)}
              className="text-xs font-bold text-[#4D7C0F] hover:underline flex items-center gap-1"
            >
              Or fill out manually
            </button>
          )}
        </div>
      )}

      {showManual && (
        <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-[#F1F4E8] animate-in fade-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Upload Crop Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                {imagePreview ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#4D7C0F]">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">Change Image</p>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl border-2 border-dashed border-[#E5EAD7] bg-[#FDFCF8] flex flex-col items-center justify-center space-y-3 hover:border-[#4D7C0F] hover:bg-[#ECFCCB]/20 transition-all">
                    <div className="w-12 h-12 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#5B6D44] group-hover:text-[#4D7C0F] transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1A2E05]">Click or drag to upload</p>
                      <p className="text-xs text-[#5B6D44]">JPG, PNG or WEBP (Max 5MB)</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                required
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains & Rice">Grains & Rice</option>
                <option value="Root Crops">Root Crops</option>
                <option value="Spices">Spices</option>
                <option value="Poultry & Eggs">Poultry & Eggs</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Crop Type</label>
              <input 
                type="text" 
                value={formData.cropType}
                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                placeholder="e.g. Yellow Corn"
                className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Quantity & Unit</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                  required
                />
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-2 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="Sacks (Kaban)">Sacks</option>
                  <option value="Metric Tons">MTons</option>
                  <option value="Cavan">Cavan</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Price Per Unit (₱)</label>
              <input 
                type="number" 
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                placeholder="0.00"
                className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Expected Date</label>
              <input 
                type="date" 
                value={formData.harvestDate}
                onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5B6D44]">Barangay</label>
              <input 
                type="text" 
                value={formData.barangay}
                onChange={(e) => setFormData({...formData, barangay: e.target.value})}
                className="w-full bg-[#FDFCF8] border border-[#E5EAD7] rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#4D7C0F] outline-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#4D7C0F] text-white rounded-2xl font-bold hover:bg-[#3F6212] transition-colors flex items-center justify-center gap-2"
          >
            {isEdit ? <Sparkles className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isEdit ? 'Update Harvest Listing' : 'Publish Harvest Listing'}
          </button>
        </form>
      )}
    </div>
  );
}



