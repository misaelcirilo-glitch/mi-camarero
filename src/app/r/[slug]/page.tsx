'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { Search, Star, Clock, ChevronRight, Flame, Loader2, Phone } from 'lucide-react'

interface Restaurant {
  name: string
  slug: string
  logo: string | null
  phone: string | null
  currency: string
}

interface Category {
  id: string
  name: string
  icon: string | null
}

interface Item {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  allergens: string[]
  tags: string[]
  calories: number | null
  prep_time_min: number
  featured: boolean
  extras: { id: string; name: string; price: number }[]
}

const ALLERGEN_ICONS: Record<string, string> = {
  gluten: '🌾', lactosa: '🥛', huevo: '🥚', pescado: '🐟', marisco: '🦐',
  frutos_secos: '🥜', soja: '🫘', apio: '🥬', mostaza: '🟡', sesamo: '⚪',
  sulfitos: '🍷', moluscos: '🐚', altramuces: '🌿', cacahuetes: '🥜',
}

const TAG_STYLES: Record<string, string> = {
  vegano: 'bg-green-100 text-green-700',
  vegetariano: 'bg-emerald-100 text-emerald-700',
  sin_gluten: 'bg-yellow-100 text-yellow-700',
  picante: 'bg-red-100 text-red-700',
  popular: 'bg-orange-100 text-orange-700',
  nuevo: 'bg-blue-100 text-blue-700',
  oferta: 'bg-purple-100 text-purple-700',
}

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/public/${slug}/carta`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        setRestaurant(data.restaurant)
        setCategories(data.categories)
        setItems(data.items)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-4xl mb-4">🍽️</p>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Restaurante no encontrado</h1>
          <p className="text-sm text-slate-500">El enlace puede estar incorrecto o el restaurante no esta disponible.</p>
        </div>
      </div>
    )
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCategory = !activeCategory || item.category_id === activeCategory
    return matchSearch && matchCategory
  })

  const featured = filtered.filter(i => i.featured)
  const grouped = categories.map(c => ({
    category: c,
    items: filtered.filter(i => i.category_id === c.id && !i.featured),
  })).filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow">
                {restaurant.name[0]}
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm">{restaurant.name}</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Carta digital</p>
              </div>
            </div>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <Phone size={16} />
              </a>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en la carta..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  !activeCategory ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Todo
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === c.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Featured */}
        {featured.length > 0 && !activeCategory && (
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
              <Flame size={16} className="text-orange-500" /> Destacados
            </h2>
            <div className="space-y-3">
              {featured.map(item => <MenuCard key={item.id} item={item} currency={restaurant.currency} />)}
            </div>
          </div>
        )}

        {/* By category */}
        {grouped.map(({ category, items: catItems }) => (
          <div key={category.id}>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="text-lg">{category.icon}</span> {category.name}
              <span className="text-xs text-slate-400 font-normal">({catItems.length})</span>
            </h2>
            <div className="space-y-3">
              {catItems.map(item => <MenuCard key={item.id} item={item} currency={restaurant.currency} />)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No se encontraron platos</p>
          </div>
        )}
      </div>

      {/* Online ordering CTA */}
      <div className="max-w-lg mx-auto px-4 pb-4">
        <a href={`/r/${slug}/pedido-online`}
          className="block bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 text-center shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all">
          <p className="font-bold">Pedir para llevar o a domicilio</p>
          <p className="text-xs text-orange-100 mt-0.5">Sin comisiones — Directamente con nosotros</p>
        </a>
      </div>

      {/* Powered by */}
      <div className="text-center py-4">
        <p className="text-[10px] text-slate-300 uppercase tracking-widest">Powered by Mi Camarero</p>
      </div>
    </div>
  )
}

function MenuCard({ item, currency }: { item: Item; currency: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
              {item.featured && <Star size={13} className="text-orange-400 fill-orange-400 shrink-0" />}
            </div>
            {item.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {item.tags?.map(t => (
                <span key={t} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TAG_STYLES[t] || 'bg-slate-100 text-slate-600'}`}>
                  {t.replace('_', ' ')}
                </span>
              ))}
              {item.allergens?.length > 0 && (
                <div className="flex gap-0.5">{item.allergens.map(a => <span key={a} className="text-xs">{ALLERGEN_ICONS[a]}</span>)}</div>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black text-orange-600 text-sm">{Number(item.price).toFixed(2)} {currency}</p>
            {item.prep_time_min && (
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5 justify-end">
                <Clock size={10} /> {item.prep_time_min} min
              </p>
            )}
          </div>
        </div>

        {/* Expanded: extras */}
        {expanded && item.extras?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Extras disponibles</p>
            <div className="space-y-1">
              {item.extras.map(e => (
                <div key={e.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{e.name}</span>
                  <span className="font-bold text-slate-700">+{Number(e.price).toFixed(2)} {currency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.extras?.length > 0 && (
          <div className="flex items-center justify-center mt-2 text-slate-300">
            <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        )}
      </div>
    </div>
  )
}
