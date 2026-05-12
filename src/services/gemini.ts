export async function parseHarvestDescription(description: string) {
  return {
    cropName: '',
    category: '',
    quantity: 0,
    unit: '',
    price: 0,
    province: '',
    targetDate: '',
    description: description,
  }
}


