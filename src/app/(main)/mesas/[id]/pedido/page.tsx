'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Plus, Minus, ShoppingBag, Search, Loader2, Check,
    Trash2, Send, Users, Utensils
} from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'
import Link from 'next/link'

interface MenuItem {
    id: string
    name: string
    description: string
    price: number
    category_name: string
    available: boolean
    image_url: string | null
}

interface Category {
    id: string
    name: string
    icon: string
}

interface CartItem {
    menu_item_id: string
    name: string
    unit_price: number
    quantity: number
    notes?: string
}

interface TableInfo {
    id: string
    number: number
    name: string
    capacity: number
    status: string
}

export default function TomarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: tableId } = use(params)
    const router = useRouter()
    const { t, formatPrice } = useI18n()

    const [table, setTable] = useState<TableInfo | null>(null)
    const [items, setItems] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showCart, setShowCart] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch(`/api/mesas`).then(r => r.json()),
            fetch(`/api/carta/platos`).then(r => r.json()),
            fetch(`/api/carta/categorias`).then(r => r.json()),
        ]).then(([tablesData, itemsData, catsData]) => {
            const t = (tablesData.tables || []).find((x: TableInfo) => x.id === tableId)
            setTable(t || null)
            setItems(itemsData.items || [])
            setCategories(catsData.categories || [])
            if (catsData.categories?.length > 0) setActiveCategory(catsData.categories[0].id)
        }).finally(() => setLoading(false))
    }, [tableId])

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(c => c.menu_item_id === item.id)
            if (existing) {
                return prev.map(c => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
            }
            return [...prev, { menu_item_id: item.id, name: item.name, unit_price: Number(item.price), quantity: 1 }]
        })
    }

    const updateQty = (menu_item_id: string, delta: number) => {
        setCart(prev => prev
            .map(c => c.menu_item_id === menu_item_id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c)
            .filter(c => c.quantity > 0))
    }

    const removeItem = (menu_item_id: string) => {
        setCart(prev => prev.filter(c => c.menu_item_id !== menu_item_id))
    }

    const submitOrder = async () => {
        if (cart.length === 0) return
        setSubmitting(true)
        try {
            const res = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_id: tableId,
                    type: 'dine_in',
                    notes: notes || undefined,
                    items: cart.map(c => ({
                        menu_item_id: c.menu_item_id,
                        name: c.name,
                        quantity: c.quantity,
                        unit_price: c.unit_price,
                        extras: [],
                        notes: c.notes,
                    })),
                }),
            })
            if (res.ok) {
                router.push('/pedidos')
            } else {
                const err = await res.json()
                alert(err.error || 'Error al crear pedido')
                setSubmitting(false)
            }
        } catch {
            setSubmitting(false)
        }
    }

    const filtered = items.filter(item => {
        if (!item.available) return false
        if (search) return item.name.toLowerCase().includes(search.toLowerCase())
        if (activeCategory) {
            const cat = categories.find(c => c.id === activeCategory)
            return item.category_name === cat?.name
        }
        return true
    })

    const cartTotal = cart.reduce((acc, c) => acc + c.unit_price * c.quantity, 0)
    const cartCount = cart.reduce((acc, c) => acc + c.quantity, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
        )
    }

    if (!table) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Mesa no encontrada</p>
                <Link href="/mesas" className="text-orange-600 font-bold hover:underline mt-3 inline-block">Volver a mesas</Link>
            </div>
        )
    }

    return (
        <div className="space-y-5 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/mesas" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ArrowLeft size={18} className="text-slate-600" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-slate-900">Mesa {table.number}</h1>
                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                        <Users size={14} /> {table.capacity} {t.mesas.persons} · {table.name}
                    </p>
                </div>
            </div>

            {/* Search + categories */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 sticky top-0 z-10">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar plato..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                {categories.length > 0 && !search && (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                    activeCategory === c.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {c.icon} {c.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Menu items */}
            <div className="space-y-2">
                {filtered.map(item => {
                    const inCart = cart.find(c => c.menu_item_id === item.id)
                    return (
                        <div key={item.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                {item.description && (
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                                )}
                                <p className="font-bold text-orange-600 text-sm tabular-nums mt-1.5">{formatPrice(Number(item.price))}</p>
                            </div>
                            {inCart ? (
                                <div className="flex items-center gap-1 bg-orange-500 rounded-lg shrink-0">
                                    <button
                                        onClick={() => updateQty(item.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-orange-600 rounded-l-lg transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-white font-bold text-sm min-w-[20px] text-center">{inCart.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-orange-600 rounded-r-lg transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart(item)}
                                    className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors shrink-0"
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                    )
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                        <Utensils size={32} className="mx-auto mb-3 opacity-30" />
                        Sin platos en esta categoría
                    </div>
                )}
            </div>

            {/* Floating cart button */}
            {cart.length > 0 && (
                <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:max-w-md z-30">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-5 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-between transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingBag size={20} />
                                <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </div>
                            <span className="font-bold">Ver pedido</span>
                        </div>
                        <span className="font-black tabular-nums">{formatPrice(cartTotal)}</span>
                    </button>
                </div>
            )}

            {/* Cart modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-lg">Pedido — Mesa {table.number}</h3>
                            <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {cart.map(item => (
                                <div key={item.menu_item_id} className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-500 tabular-nums">{formatPrice(item.unit_price)} c/u</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg">
                                        <button onClick={() => updateQty(item.menu_item_id, -1)} className="w-7 h-7 text-slate-600 hover:bg-slate-200 rounded-l-lg flex items-center justify-center">
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-slate-800 font-bold text-xs min-w-[20px] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.menu_item_id, 1)} className="w-7 h-7 text-slate-600 hover:bg-slate-200 rounded-r-lg flex items-center justify-center">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <p className="font-bold text-slate-800 text-sm tabular-nums w-16 text-right">
                                        {formatPrice(item.unit_price * item.quantity)}
                                    </p>
                                    <button onClick={() => removeItem(item.menu_item_id)} className="text-slate-300 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-3">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notas para cocina</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Sin sal, alergias, preferencias..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="border-t border-slate-100 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-medium">Total</span>
                                <span className="text-2xl font-black text-slate-900 tabular-nums">{formatPrice(cartTotal)}</span>
                            </div>
                            <button
                                onClick={submitOrder}
                                disabled={submitting}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {submitting ? 'Enviando...' : 'Enviar a cocina'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
