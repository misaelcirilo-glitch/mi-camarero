'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Plus, Minus, ShoppingCart, Trash2, Send, CheckCircle, Loader2, ChevronDown, Star, X } from 'lucide-react'

interface Item {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  allergens: string[]
  tags: string[]
  featured: boolean
  extras: { id: string; name: string; price: number }[]
}

interface CartItem {
  menuItem: Item
  quantity: number
  selectedExtras: { name: string; price: number }[]
  notes: string
}

interface Category {
  id: string
  name: string
  icon: string | null
}

const TAG_STYLES: Record<string, string> = {
  vegano: 'bg-green-100 text-green-700', vegetariano: 'bg-emerald-100 text-emerald-700',
  sin_gluten: 'bg-yellow-100 text-yellow-700', picante: 'bg-red-100 text-red-700',
  popular: 'bg-orange-100 text-orange-700', nuevo: 'bg-blue-100 text-blue-700',
}

export default function PedirPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-orange-500" /></div>}>
      <PedirContent params={params} />
    </Suspense>
  )
}

function PedirContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const mesa = parseInt(searchParams.get('mesa') || '0')

  const [restaurant, setRestaurant] = useState<{ name: string; currency: string } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [orderSent, setOrderSent] = useState<{ order_number: number; total: number } | null>(null)
  const [itemDetail, setItemDetail] = useState<Item | null>(null)
  const [detailExtras, setDetailExtras] = useState<{ name: string; price: number }[]>([])
  const [detailNotes, setDetailNotes] = useState('')

  useEffect(() => {
    fetch(`/api/public/${slug}/carta`)
      .then(r => r.json())
      .then(data => {
        setRestaurant(data.restaurant)
        setCategories(data.categories || [])
        setItems(data.items || [])
      })
      .finally(() => setLoading(false))
  }, [slug])

  const addToCart = (item: Item, extras: { name: string; price: number }[] = [], notes: string = '') => {
    setCart(prev => {
      const existing = prev.findIndex(c => c.menuItem.id === item.id && JSON.stringify(c.selectedExtras) === JSON.stringify(extras) && c.notes === notes)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
        return updated
      }
      return [...prev, { menuItem: item, quantity: 1, selectedExtras: extras, notes }]
    })
  }

  const quickAdd = (item: Item) => {
    if (item.extras?.length > 0) {
      setItemDetail(item)
      setDetailExtras([])
      setDetailNotes('')
    } else {
      addToCart(item)
    }
  }

  const confirmDetail = () => {
    if (itemDetail) {
      addToCart(itemDetail, detailExtras, detailNotes)
      setItemDetail(null)
    }
  }

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], quantity: updated[index].quantity + delta }
      return updated.filter(c => c.quantity > 0)
    })
  }

  const cartTotal = cart.reduce((acc, c) => {
    const extrasTotal = c.selectedExtras.reduce((a, e) => a + e.price, 0)
    return acc + (c.menuItem.price + extrasTotal) * c.quantity
  }, 0)

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0)

  const handleSendOrder = async () => {
    if (cart.length === 0 || !mesa) return
    setSending(true)
    try {
      const res = await fetch(`/api/public/${slug}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesa,
          items: cart.map(c => ({
            menu_item_id: c.menuItem.id,
            name: c.menuItem.name,
            quantity: c.quantity,
            unit_price: c.menuItem.price,
            extras: c.selectedExtras,
            notes: c.notes || undefined,
          })),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrderSent({ order_number: data.order_number, total: data.total })
        setCart([])
        setCartOpen(false)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (orderSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Pedido enviado!</h1>
          <p className="text-slate-500 mb-4">Tu pedido #{orderSent.order_number} ha sido recibido por la cocina.</p>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
            <p className="text-sm text-slate-500">Total estimado</p>
            <p className="text-3xl font-black text-slate-900">{orderSent.total.toFixed(2)} EUR</p>
            <p className="text-xs text-slate-400 mt-1">IVA incluido</p>
          </div>
          <p className="text-sm text-slate-400 mb-6">Mesa #{mesa} — Te avisaremos cuando este listo</p>
          <button
            onClick={() => setOrderSent(null)}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
          >
            Pedir algo mas
          </button>
        </div>
      </div>
    )
  }

  if (!mesa) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-4xl mb-4">📱</p>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Escanea el QR de tu mesa</h1>
          <p className="text-sm text-slate-500">Para hacer un pedido necesitas escanear el codigo QR que hay en tu mesa.</p>
        </div>
      </div>
    )
  }

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || i.category_id === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 text-sm">{restaurant?.name}</h1>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Mesa #{mesa}</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xs">
              {restaurant?.name?.[0]}
            </div>
          </div>

          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 -mx-4 px-4">
              <button onClick={() => setActiveCategory(null)} className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${!activeCategory ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Todo</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${activeCategory === c.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {filtered.map(item => {
          const inCart = cart.filter(c => c.menuItem.id === item.id).reduce((a, c) => a + c.quantity, 0)
          return (
            <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3" onClick={() => quickAdd(item)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                  {item.featured && <Star size={12} className="text-orange-400 fill-orange-400 shrink-0" />}
                </div>
                {item.description && <p className="text-[11px] text-slate-400 truncate">{item.description}</p>}
                <div className="flex items-center gap-1 mt-1">
                  {item.tags?.slice(0, 2).map(t => (
                    <span key={t} className={`text-[8px] font-bold px-1 py-0.5 rounded ${TAG_STYLES[t] || 'bg-slate-100 text-slate-600'}`}>{t.replace('_', ' ')}</span>
                  ))}
                  {item.extras?.length > 0 && <span className="text-[8px] text-slate-400">+extras</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-orange-600 text-sm">{Number(item.price).toFixed(2)}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); quickAdd(item) }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  inCart > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600'
                }`}
              >
                {inCart > 0 ? <span className="text-xs font-black">{inCart}</span> : <Plus size={16} />}
              </button>
            </div>
          )
        })}
      </div>

      {/* Item detail modal (for extras) */}
      {itemDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{itemDetail.name}</h3>
                <p className="text-sm text-orange-600 font-bold">{Number(itemDetail.price).toFixed(2)} EUR</p>
              </div>
              <button onClick={() => setItemDetail(null)} className="text-slate-400"><X size={20} /></button>
            </div>

            {itemDetail.extras?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Extras</p>
                {itemDetail.extras.map(e => {
                  const selected = detailExtras.some(de => de.name === e.name)
                  return (
                    <button key={e.id}
                      onClick={() => setDetailExtras(prev => selected ? prev.filter(de => de.name !== e.name) : [...prev, { name: e.name, price: e.price }])}
                      className={`flex items-center justify-between w-full p-3 rounded-xl mb-1 border transition-all ${selected ? 'border-orange-400 bg-orange-50' : 'border-slate-100'}`}>
                      <span className="text-sm text-slate-700">{e.name}</span>
                      <span className="text-sm font-bold text-slate-600">+{Number(e.price).toFixed(2)}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notas</p>
              <input type="text" value={detailNotes} onChange={e => setDetailNotes(e.target.value)}
                placeholder="Sin cebolla, poco hecho..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>

            <button onClick={confirmDetail} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/30">
              Anadir al pedido — {(Number(itemDetail.price) + detailExtras.reduce((a, e) => a + e.price, 0)).toFixed(2)} EUR
            </button>
          </div>
        </div>
      )}

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          {cartOpen && (
            <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-t-3xl shadow-2xl p-4 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800">Tu pedido</h3>
                <button onClick={() => setCartOpen(false)} className="text-slate-400"><ChevronDown size={20} /></button>
              </div>
              <div className="space-y-2">
                {cart.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(i, -1)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><Minus size={14} /></button>
                      <span className="text-sm font-bold w-5 text-center">{c.quantity}</span>
                      <button onClick={() => updateQuantity(i, 1)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><Plus size={14} /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{c.menuItem.name}</p>
                      {c.selectedExtras.length > 0 && <p className="text-[10px] text-slate-400">+{c.selectedExtras.map(e => e.name).join(', ')}</p>}
                      {c.notes && <p className="text-[10px] text-orange-500 italic">{c.notes}</p>}
                    </div>
                    <p className="text-sm font-bold text-slate-800 shrink-0">
                      {((c.menuItem.price + c.selectedExtras.reduce((a, e) => a + e.price, 0)) * c.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-lg mx-auto px-4 pb-4">
            <button
              onClick={() => cartOpen ? handleSendOrder() : setCartOpen(true)}
              disabled={sending}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-2xl shadow-orange-500/40"
            >
              <div className="flex items-center gap-2">
                {sending ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                <span>{cartOpen ? 'Enviar pedido' : 'Ver pedido'}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
              </div>
              <span className="text-lg font-black">{cartTotal.toFixed(2)} EUR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
