'use client'

import { useState, useEffect, use } from 'react'
import { Search, Plus, Minus, ShoppingCart, CheckCircle, Loader2, Star, X, Sparkles, Truck, ShoppingBag, Phone, MapPin, User } from 'lucide-react'

interface Item {
  id: string; category_id: string | null; name: string; description: string | null
  price: number; tags: string[]; featured: boolean; extras: { id: string; name: string; price: number }[]
}
interface Category { id: string; name: string; icon: string | null }
interface CartItem { menuItem: Item; quantity: number; selectedExtras: { name: string; price: number }[]; notes: string }

const TAG_STYLES: Record<string, string> = {
  vegano: 'bg-green-100 text-green-700', vegetariano: 'bg-emerald-100 text-emerald-700',
  picante: 'bg-red-100 text-red-700', popular: 'bg-orange-100 text-orange-700',
}

export default function PedidoOnlinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [restaurant, setRestaurant] = useState<{ name: string; currency: string; phone: string | null } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<'takeaway' | 'delivery'>('takeaway')
  const [step, setStep] = useState<'menu' | 'checkout' | 'done'>('menu')
  const [sending, setSending] = useState(false)
  const [orderResult, setOrderResult] = useState<{ order_number: number; total: number } | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [itemDetail, setItemDetail] = useState<Item | null>(null)
  const [detailExtras, setDetailExtras] = useState<{ name: string; price: number }[]>([])
  const [detailNotes, setDetailNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/public/${slug}/carta`)
      .then(r => r.json())
      .then(data => { setRestaurant(data.restaurant); setCategories(data.categories || []); setItems(data.items || []) })
      .finally(() => setLoading(false))
  }, [slug])

  const addToCart = (item: Item, extras: { name: string; price: number }[] = [], notes: string = '') => {
    setCart(prev => {
      const key = item.id + JSON.stringify(extras) + notes
      const idx = prev.findIndex(c => c.menuItem.id + JSON.stringify(c.selectedExtras) + c.notes === key)
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], quantity: u[idx].quantity + 1 }; return u }
      return [...prev, { menuItem: item, quantity: 1, selectedExtras: extras, notes }]
    })
  }

  const quickAdd = (item: Item) => {
    if (item.extras?.length > 0) { setItemDetail(item); setDetailExtras([]); setDetailNotes('') }
    else addToCart(item)
  }

  const updateQty = (i: number, d: number) => setCart(prev => prev.map((c, idx) => idx === i ? { ...c, quantity: c.quantity + d } : c).filter(c => c.quantity > 0))

  const cartTotal = cart.reduce((a, c) => a + (c.menuItem.price + c.selectedExtras.reduce((x, e) => x + e.price, 0)) * c.quantity, 0)
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0)

  const handleOrder = async () => {
    if (!form.name || !form.phone) { setError('Nombre y telefono son obligatorios'); return }
    if (orderType === 'delivery' && !form.address) { setError('Direccion requerida para delivery'); return }
    setError(''); setSending(true)
    try {
      const res = await fetch(`/api/public/${slug}/pedido-online`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: orderType, customer_name: form.name, customer_phone: form.phone,
          customer_address: form.address || undefined, notes: form.notes || undefined,
          items: cart.map(c => ({ menu_item_id: c.menuItem.id, name: c.menuItem.name, quantity: c.quantity, unit_price: c.menuItem.price, extras: c.selectedExtras, notes: c.notes || undefined })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setOrderResult({ order_number: data.order_number, total: data.total })
      setCart([]); setStep('done')
    } finally { setSending(false) }
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-orange-500" /></div>

  if (step === 'done' && orderResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-green-600" /></div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Pedido recibido!</h1>
          <p className="text-slate-500 mb-4">Pedido #{orderResult.order_number} — {orderType === 'delivery' ? 'Te lo llevamos a casa' : 'Recogelo en el local'}</p>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-3xl font-black text-slate-900">{orderResult.total.toFixed(2)} EUR</p>
            <p className="text-xs text-slate-400 mt-1">IVA incluido — Pago en local</p>
          </div>
          {restaurant?.phone && (
            <a href={`tel:${restaurant.phone}`} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
              <Phone size={16} /> Llamar al restaurante
            </a>
          )}
          <button onClick={() => { setStep('menu'); setOrderResult(null) }} className="block mx-auto mt-4 text-sm text-orange-600 font-bold hover:underline">
            Hacer otro pedido
          </button>
        </div>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-slate-50 pb-6">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setStep('menu')} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            <h1 className="font-bold text-slate-900">Confirmar pedido</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setOrderType('takeaway')}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${orderType === 'takeaway' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
              <ShoppingBag size={24} className={`mx-auto mb-2 ${orderType === 'takeaway' ? 'text-orange-500' : 'text-slate-400'}`} />
              <p className="font-bold text-sm text-slate-800">Recoger</p>
              <p className="text-[10px] text-slate-400">Paso a buscarlo</p>
            </button>
            <button onClick={() => setOrderType('delivery')}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${orderType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
              <Truck size={24} className={`mx-auto mb-2 ${orderType === 'delivery' ? 'text-orange-500' : 'text-slate-400'}`} />
              <p className="font-bold text-sm text-slate-800">Delivery</p>
              <p className="text-[10px] text-slate-400">A domicilio</p>
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="Tu nombre" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefono *</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="612 345 678" />
              </div>
            </div>
            {orderType === 'delivery' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Direccion *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="Calle, numero, piso..." />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas</label>
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="Alergias, instrucciones..." />
            </div>
          </div>

          {/* Cart summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Tu pedido ({cartCount} items)</p>
            <div className="space-y-2">
              {cart.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(i, -1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 text-xs"><Minus size={12} /></button>
                      <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                      <button onClick={() => updateQty(i, 1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 text-xs"><Plus size={12} /></button>
                    </div>
                    <span className="text-slate-700 truncate">{c.menuItem.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{((c.menuItem.price + c.selectedExtras.reduce((a, e) => a + e.price, 0)) * c.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total (IVA incl.)</span>
              <span className="text-xl font-black text-slate-900">{(cartTotal * 1.10).toFixed(2)} EUR</span>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>}

          <button onClick={handleOrder} disabled={sending || cart.length === 0}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-2xl shadow-orange-500/40 flex items-center justify-center gap-2">
            {sending ? <Loader2 size={18} className="animate-spin" /> : orderType === 'delivery' ? <Truck size={18} /> : <ShoppingBag size={18} />}
            {sending ? 'Enviando...' : `Confirmar pedido — ${(cartTotal * 1.10).toFixed(2)} EUR`}
          </button>

          <p className="text-center text-[10px] text-slate-300 uppercase tracking-widest">Sin comisiones — Powered by Mi Camarero</p>
        </div>
      </div>
    )
  }

  // MENU step
  const filtered = items.filter(i => (!search || i.name.toLowerCase().includes(search.toLowerCase())) && (!activeCategory || i.category_id === activeCategory))

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 text-sm">{restaurant?.name}</h1>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Pedidos online — Sin comisiones</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xs">{restaurant?.name?.[0]}</div>
          </div>
          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
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
                  {item.tags?.slice(0, 2).map(t => <span key={t} className={`text-[8px] font-bold px-1 py-0.5 rounded ${TAG_STYLES[t] || 'bg-slate-100 text-slate-600'}`}>{t.replace('_', ' ')}</span>)}
                </div>
              </div>
              <p className="font-black text-orange-600 text-sm shrink-0">{Number(item.price).toFixed(2)}</p>
              <button onClick={e => { e.stopPropagation(); quickAdd(item) }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${inCart > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {inCart > 0 ? <span className="text-xs font-black">{inCart}</span> : <Plus size={16} />}
              </button>
            </div>
          )
        })}
      </div>

      {/* Item detail modal */}
      {itemDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="font-bold text-slate-900">{itemDetail.name}</h3><p className="text-sm text-orange-600 font-bold">{Number(itemDetail.price).toFixed(2)} EUR</p></div>
              <button onClick={() => setItemDetail(null)} className="text-slate-400"><X size={20} /></button>
            </div>
            {itemDetail.extras?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Extras</p>
                {itemDetail.extras.map(e => {
                  const sel = detailExtras.some(de => de.name === e.name)
                  return <button key={e.id} onClick={() => setDetailExtras(p => sel ? p.filter(de => de.name !== e.name) : [...p, { name: e.name, price: e.price }])}
                    className={`flex items-center justify-between w-full p-3 rounded-xl mb-1 border transition-all ${sel ? 'border-orange-400 bg-orange-50' : 'border-slate-100'}`}>
                    <span className="text-sm text-slate-700">{e.name}</span><span className="text-sm font-bold text-slate-600">+{Number(e.price).toFixed(2)}</span>
                  </button>
                })}
              </div>
            )}
            <input type="text" value={detailNotes} onChange={e => setDetailNotes(e.target.value)} placeholder="Notas..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-200" />
            <button onClick={() => { if (itemDetail) { addToCart(itemDetail, detailExtras, detailNotes); setItemDetail(null) } }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/30">
              Anadir — {(Number(itemDetail.price) + detailExtras.reduce((a, e) => a + e.price, 0)).toFixed(2)} EUR
            </button>
          </div>
        </div>
      )}

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pb-4">
          <button onClick={() => setStep('checkout')}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/40">
            <div className="flex items-center gap-2"><ShoppingCart size={18} /><span>Ver pedido</span><span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartCount}</span></div>
            <span className="text-lg font-black">{cartTotal.toFixed(2)} EUR</span>
          </button>
        </div>
      )}
    </div>
  )
}
