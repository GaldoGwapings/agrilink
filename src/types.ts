export interface User {
  id: string
  name?: string
  email?: string
  phone?: string
  full_name?: string
  region?: string
  role: 'farmer' | 'buyer' | 'logistics' | 'admin'
  location?: string
  avatar_url?: string
  created_at?: string
}

export interface Harvest {
  id: string
  farmerId: string
  cropName?: string
  cropType: string
  category: string
  quantity: number
  unit: string
  price?: number
  pricePerUnit?: number
  province?: string
  municipality?: string   // added: supports full PH location chain
  barangay?: string
  harvestDate: string
  description?: string
  status?: 'pending' | 'available' | 'sold' | 'expired'
  images?: string[]
  imageUrl?: string
  lat?: number
  lng?: number
  createdAt?: string
}

export interface BuyerLead {
  id: string | number
  buyerId?: string
  buyerName: string
  harvestId?: string
  cropName: string
  quantity: number | string
  location?: string
  phone?: string
  message?: string
  date?: string
  status: 'pending' | 'on_the_way' | 'completed'
  farmerId?: string
  createdAt?: string
}

export interface HarvestFormData {
  cropType: string
  category: string
  quantity: number
  unit: string
  price?: number
  province: string
  municipality?: string   // added to match form
  barangay?: string
  harvestDate: string
  description?: string
}