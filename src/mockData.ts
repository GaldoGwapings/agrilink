// src/mockData.ts

import type { Harvest, BuyerLead } from './types'

export const MOCK_HARVESTS: Harvest[] = [
  {
    id: 'h-1',
    farmerId: 'u-1',
    cropName: 'Rice',
    category: 'Grains & Rice',
    quantity: 1200,
    unit: 'kg',
    price: 25,
    province: 'Nueva Ecija',
    barangay: 'San Jose',
    harvestDate: '2026-10-15',
    lat: 15.6167,
    lng: 120.9333,
    status: 'available'
  },
  {
    id: 'h-2',
    farmerId: 'u-1',
    cropName: 'Corn',
    category: 'Grains & Rice',
    quantity: 500,
    unit: 'kg',
    price: 18,
    province: 'Bukidnon',
    barangay: 'Malaybalay',
    harvestDate: '2026-10-22',
    lat: 8.1563,
    lng: 125.1131,
    status: 'available'
  },
  {
    id: 'h-3',
    farmerId: 'u-1',
    cropName: 'Tomatoes',
    category: 'Vegetables',
    quantity: 150,
    unit: 'kg',
    price: 40,
    province: 'Bukidnon',
    barangay: 'Impasugong',
    harvestDate: '2026-11-05',
    lat: 8.2917,
    lng: 124.9667,
    status: 'pending'
  }
]

// Updated to match BuyerLead interface
export const MOCK_BUYER_LEADS: BuyerLead[] = [
  {
    id: '1',
    buyerId: 'b-1',
    harvestId: 'h-1',
    buyerName: 'Reyes Trading Corp',
    cropName: 'Rice',
    quantity: 500,
    createdAt: '2026-10-01T08:00:00Z',
    status: 'pending'
  },
  {
    id: '2',
    buyerId: 'b-2',
    harvestId: 'h-2',
    buyerName: 'San Miguel Foods',
    cropName: 'Corn',
    quantity: 1000,
    createdAt: '2026-10-05T09:30:00Z',
    status: 'pending'
  }
]