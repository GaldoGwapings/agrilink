export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  region: string
  role: 'farmer' | 'buyer'
}

export interface Harvest {
  id: string
  farmerId: string
  cropName: string
  cropType?: string
  category: string
  quantity: number
  unit: string
  price: number
  pricePerUnit?: number
  province: string
  barangay?: string
  harvestDate: string
  description?: string
  status: 'available' | 'pending' | 'sold'
  images?: string[]
  imageUrl?: string
  lat: number
  lng: number
}

export interface BuyerLead {
  id: string
  buyerId: string
  buyerName: string
  harvestId: string
  cropName: string
  quantity: number
  message?: string
  status: 'pending' | 'on_the_way' | 'completed'
  createdAt: string
}
