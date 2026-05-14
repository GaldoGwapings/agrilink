export interface User {
  id: string
  full_name?: string
  name?: string
  email?: string
  phone?: string
  region?: string
  role: 'farmer' | 'buyer' | 'logistics' | 'admin'
  location?: string
  avatar_url?: string
  created_at?: string
}

export interface Harvest {
  id: string
  farmer_id: string
  crop_type: string
  category: string
  quantity: number
  unit: string
  price_per_unit?: number | null
  province?: string
  municipality?: string
  barangay?: string
  harvest_date: string
  description?: string
  status?: 'active' | 'sold' | 'expired' | 'pending'
  image_url?: string | null
  lat?: number
  lng?: number
  created_at?: string
  updated_at?: string
}

export interface BuyerLead {
  id: string | number
  buyer_id?: string
  buyer_name: string
  harvest_id?: string
  crop_name: string
  quantity: number | string
  location?: string
  phone?: string
  message?: string
  date?: string
  status: 'pending' | 'on_the_way' | 'completed'
  farmer_id?: string
  created_at?: string
}

export interface HarvestFormData {
  crop_type: string
  category: string
  quantity: number
  unit: string
  price_per_unit?: number | null
  province: string
  municipality?: string
  barangay?: string
  harvest_date: string
  description?: string
  image_url?: string | null
}