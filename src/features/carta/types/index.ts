export interface MenuCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  position: number
  active: boolean
  item_count: number
}

export interface MenuItemExtra {
  id?: string
  name: string
  price: number
  active?: boolean
}

export interface MenuItem {
  id: string
  category_id: string | null
  category_name: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  allergens: string[]
  tags: string[]
  calories: number | null
  prep_time_min: number
  available: boolean
  featured: boolean
  position: number
  extras: MenuItemExtra[]
}

export const ALLERGENS = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'lactosa', label: 'Lactosa', icon: '🥛' },
  { id: 'huevo', label: 'Huevo', icon: '🥚' },
  { id: 'pescado', label: 'Pescado', icon: '🐟' },
  { id: 'marisco', label: 'Marisco', icon: '🦐' },
  { id: 'frutos_secos', label: 'Frutos secos', icon: '🥜' },
  { id: 'soja', label: 'Soja', icon: '🫘' },
  { id: 'apio', label: 'Apio', icon: '🥬' },
  { id: 'mostaza', label: 'Mostaza', icon: '🟡' },
  { id: 'sesamo', label: 'Sesamo', icon: '⚪' },
  { id: 'sulfitos', label: 'Sulfitos', icon: '🍷' },
  { id: 'moluscos', label: 'Moluscos', icon: '🐚' },
  { id: 'altramuces', label: 'Altramuces', icon: '🌿' },
  { id: 'cacahuetes', label: 'Cacahuetes', icon: '🥜' },
]

export const TAGS = [
  { id: 'vegano', label: 'Vegano', color: 'bg-green-100 text-green-700' },
  { id: 'vegetariano', label: 'Vegetariano', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'sin_gluten', label: 'Sin gluten', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'picante', label: 'Picante', color: 'bg-red-100 text-red-700' },
  { id: 'popular', label: 'Popular', color: 'bg-orange-100 text-orange-700' },
  { id: 'nuevo', label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
  { id: 'oferta', label: 'Oferta', color: 'bg-purple-100 text-purple-700' },
]
