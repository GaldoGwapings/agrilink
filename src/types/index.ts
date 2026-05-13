// src/types/index.ts

export interface Harvest {
  id: string
  farmerId: string
  cropType: string
  category: string
  quantity: number
  unit: string
  price?: number
  province?: string
  barangay?: string
  harvestDate: string
  description?: string
  lat: number
  lng: number
  status?: 'pending' | 'available' | 'sold' | 'expired'
  createdAt?: string
}

export interface User {
  id: string
  email?: string
  phone?: string
  full_name?: string
  role: 'farmer' | 'buyer' | 'logistics' | 'admin'
  location?: string
  avatar_url?: string
  created_at?: string
}

// Make sure the interface name matches exactly what you import
export interface BuyerLead {
  id: number | string
  buyerName: string           // Changed from 'name' to 'buyerName'
  cropName: string            // Changed from 'crop' to 'cropName'  
  quantity: string | number
  location: string
  phone: string
  date: string
  status: 'pending' | 'completed'
  farmerId: string
}

export interface HarvestFormData {
  cropType: string
  category: string
  quantity: number
  unit: string
  price?: number
  province: string
  barangay?: string
  harvestDate: string
  description?: string
}