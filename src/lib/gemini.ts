const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export interface ParsedHarvestData {
  cropName: string
  category: string
  quantity: number
  unit: string
  price: number
  province: string
  municipality: string
  barangay: string
  targetDate: string
  description: string
  confidence: number
}

export interface AIRecommendation {
  message: string
  suggestedPrice?: number
  suggestedBuyers?: number
  optimalListingDate?: string
  marketDemand?: 'high' | 'medium' | 'low'
}

export async function parseHarvestDescription(description: string): Promise<ParsedHarvestData> {
  if (!GROQ_API_KEY) return getFallbackParsedData(description)

  const prompt = `You are an AI assistant for AgriLink, a Philippine agricultural platform. Extract harvest information from the farmer's message. Return ONLY valid JSON with no markdown, no backticks, no explanation.

Message: "${description}"

For location extraction, follow these rules:
- If the message mentions a barangay, municipality/city, AND province — fill all three separately
- If only a municipality/city and province are mentioned (e.g. "Manolo Fortich, Bukidnon") — put the municipality in "barangay" field and province in "province"
- If only a province is mentioned — put it in "province" and leave "barangay" empty
- Common Philippine provinces: Bukidnon, Cebu, Davao, Nueva Ecija, Pangasinan, Batangas, Misamis Oriental, Misamis Occidental, etc.
- Common municipalities in Bukidnon: Manolo Fortich, Malaybalay, Valencia, Impasug-ong, Lantapan, Sumilao, Cabanglasan, Kitaotao, etc.
- If a place name is a municipality or city, put it in "barangay" field
- If a place name is a province, put it in "province" field

Return this exact JSON format:
{
  "cropName": "crop type in English",
  "category": "one of: Vegetables, Fruits, Grains & Rice, Root Crops, Spices, Poultry & Eggs",
  "quantity": 0,
  "unit": "one of: kg, sacks, cavan, pieces, bunches",
  "price": 0,
  "province": "Philippine province name only",
  "barangay": "barangay or municipality name if mentioned",
  "targetDate": "YYYY-MM-DD",
  "confidence": 0.9
}`

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500
      })
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    let text = data.choices?.[0]?.message?.content || '{}'
    text = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)

    return {
      cropName: parsed.cropName || '',
      category: parsed.category || 'Vegetables',
      quantity: parsed.quantity || 0,
      unit: parsed.unit || 'kg',
      price: parsed.price || 0,
      province: parsed.province || '',
      barangay: parsed.barangay || '',
      municipality: parsed.municipality || '',
      targetDate: parsed.targetDate || '',
      description: description,
      confidence: parsed.confidence || 0.5
    }
  } catch (error) {
    console.error('Gemini parse error:', error)
    return getFallbackParsedData(description)
  }
}

export async function getSmartListingRecommendations(
  cropType: string,
  province: string,
  harvestDate: string
): Promise<AIRecommendation> {
  if (!GROQ_API_KEY) return getFallbackRecommendation(cropType)

  const prompt = `You are an AI agricultural advisor for AgriLink in the Philippines. Return ONLY valid JSON with no markdown, no backticks, no explanation.

Crop: ${cropType}
Province: ${province}
Harvest Date: ${harvestDate}

Use these REAL current Philippine farmgate price ranges as your baseline:
- Rice: ₱50-60/kg
- Corn: ₱18-22/kg
- Tomato: ₱40-80/kg
- Onion (red): ₱80-120/kg
- Onion (white): ₱60-100/kg
- Cabbage: ₱25-40/kg
- Eggplant: ₱30-50/kg
- Ampalaya: ₱40-70/kg
- Sitaw: ₱35-55/kg
- Pechay: ₱20-35/kg
- Potato: ₱40-60/kg
- Carrot: ₱50-80/kg
- Garlic: ₱150-200/kg
- Ginger: ₱80-120/kg
- Banana (Lakatan): ₱30-50/kg
- Mango: ₱60-100/kg
- Pineapple: ₱20-35/kg
- Mongo/Mungbean: ₱70-90/kg
- Kamote: ₱20-35/kg
- Cassava: ₱8-12/kg
- Sugarcane: ₱2-4/kg
- Cacao: ₱90-130/kg
- Coffee (Robusta): ₱80-120/kg

For the suggestedPrice, pick a realistic mid-range value based on the crop above.
For market demand, consider that Bukidnon, Nueva Ecija, Pangasinan, and Isabela are high-supply areas so demand may be medium. Metro Manila nearby provinces tend to have higher demand.
For suggestedBuyers, estimate between 3-15 based on crop popularity.

Return this exact JSON format:
{
  "message": "helpful practical advice in Taglish, mention the crop and province specifically",
  "suggestedPrice": 55,
  "suggestedBuyers": 8,
  "optimalListingDate": "2 weeks before harvest",
  "marketDemand": "high"
}`

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    let text = data.choices?.[0]?.message?.content || '{}'
    text = text.replace(/```json|```/g, '').trim()
    return JSON.parse(text)
  } catch (error) {
    console.error('Gemini recommendation error:', error)
    return getFallbackRecommendation(cropType)
  }
}

export async function chatWithAI(message: string, context?: { role: string; province?: string }): Promise<string> {
  if (!GROQ_API_KEY) return getFallbackChatResponse(message)

  const prompt = `You are "Ani", a friendly AI agricultural assistant for AgriLink in the Philippines. You speak Taglish (mix of Tagalog and English).

User role: ${context?.role || 'farmer'}
User province: ${context?.province || 'unknown'}

User message: "${message}"

Respond helpfully about harvest registration, finding buyers, market prices, and using AgriLink. Keep responses short and encouraging.`

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    return data.choices?.[0]?.message?.content || getFallbackChatResponse(message)
  } catch (error) {
    console.error('Gemini chat error:', error)
    return getFallbackChatResponse(message)
  }
}

function getFallbackParsedData(description: string): ParsedHarvestData {
  return {
    cropName: '', category: 'Vegetables', quantity: 0,
    unit: 'kg', price: 0, province: '', barangay: '', municipality:'',
    targetDate: '', description: description, confidence: 0
  }
}

function getFallbackRecommendation(cropType: string): AIRecommendation {
  return {
    message: `Para sa ${cropType}, maganda mag-list 2 linggo bago ang harvest. Maraming buyers sa inyong lugar.`,
    suggestedPrice: 55, suggestedBuyers: 8,
    optimalListingDate: '2 weeks before harvest', marketDemand: 'medium'
  }
}

function getFallbackChatResponse(message: string): string {
  const lowerMsg = message.toLowerCase()
  if (lowerMsg.includes('harvest') || lowerMsg.includes('ani'))
    return "Para mag-list ng harvest, pindutin ang 'Register New Harvest' button. Ilagay ang crop type, quantity, at expected harvest date!"
  if (lowerMsg.includes('buyer') || lowerMsg.includes('bumili'))
    return "Ang mga interested buyers ay lalabas sa 'Interested Buyers' page. Pwede mo silang kontakin para sa negosasyon."
  if (lowerMsg.includes('price') || lowerMsg.includes('presyo'))
    return "Ang presyo ay depende sa crop at season. I-check ang market trends sa inyong lugar."
  return "Salamat sa iyong mensahe! Paano kita matutulungan? Magtanong lang tungkol sa harvest, buyers, o paggamit ng AgriLink."
}