import type { Harvest, BuyerLead } from './types'

export const MOCK_BUYER_LEADS: BuyerLead[] = [
  { id: 1, farmerId: "f1", listingId: "h1", name: "Wholesale Buyer Juan", crop: "Corn", quantity: "50 Sacks", phone: "0917-123-4567", location: "Cagayan de Oro City", status: "pending", date: "2026-05-09" },
  { id: 2, farmerId: "f1", listingId: "h1", name: "Market Vendor Maria", crop: "Rice", quantity: "120 Sacks", phone: "0918-765-4321", location: "Valencia Public Market", status: "pending", date: "2026-05-08" },
  { id: 3, farmerId: "f1", listingId: "h1", name: "AgriExporter Inc", crop: "Corn", quantity: "200 Sacks", phone: "0920-555-0000", location: "Manila North Harbor", status: "pending", date: "2026-05-07" },
  { id: 4, farmerId: "f2", listingId: "h2", name: "Binalonan Trading", crop: "Palay", quantity: "80 Sacks", phone: "0999-111-2222", location: "Pangasinan", status: "completed", date: "2026-05-05" },
];

export const MOCK_HARVESTS: Harvest[] = [
  {
    id: "h1",
    farmerId: "f1",
    cropType: "Yellow Corn",
    quantity: 50,
    unit: "Sacks (Kaban)",
    pricePerUnit: 1200,
    imageUrl: "https://images.unsplash.com/photo-1551727041-5b347d65b633",
    category: "Grains & Rice",
    harvestDate: "2026-05-20",
    barangay: "Sumilao",
    province: "Bukidnon",
    lat: 8.2917,
    lng: 124.9667,
    status: "available",
    createdAt: "2026-05-01T08:00:00Z"
  },
  {
    id: "h2",
    farmerId: "f2",
    cropType: "Palay (Rice)",
    quantity: 120,
    unit: "Sacks (Kaban)",
    pricePerUnit: 1100,
    imageUrl: "https://images.unsplash.com/photo-1536633340147-7859b8632c1c",
    category: "Grains & Rice",
    harvestDate: "2026-05-25",
    barangay: "Binalonan",
    province: "Pangasinan",
    lat: 16.0506,
    lng: 120.5922,
    status: "pending",
    createdAt: "2026-05-02T10:30:00Z"
  },
  {
    id: "h3",
    farmerId: "f3",
    cropType: "Red Onions",
    quantity: 2,
    unit: "Metric Tons",
    pricePerUnit: 45000,
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb",
    category: "Vegetables",
    harvestDate: "2026-05-15",
    barangay: "Bongabon",
    province: "Nueva Ecija",
    lat: 15.6322,
    lng: 121.1378,
    status: "available",
    createdAt: "2026-05-03T14:15:00Z"
  },
  {
    id: "h4",
    farmerId: "f4",
    cropType: "Tomatoes",
    quantity: 800,
    unit: "kg",
    pricePerUnit: 45,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
    category: "Vegetables",
    harvestDate: "2026-05-18",
    barangay: "Tupi",
    province: "South Cotabato",
    lat: 6.3333,
    lng: 125.0,
    status: "available",
    createdAt: "2026-05-04T09:45:00Z"
  }
];


