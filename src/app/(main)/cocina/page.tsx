'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChefHat, Clock, CheckCircle, Loader2, RefreshCw, Flame, Bell } from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'

interface OrderItem {
  id: string
  name: string
  quantity: number
  extras: { name: string; price: number }[]
  notes: string | null
  status: string
}

interface KitchenOrder {
  id: string
  order_number: number
  table_number: number | null
  table_name: string | null
  type: string
  status: string
  created_at: string
  items: OrderItem[]
}

export default function CocinaPage() {
  const { t } = useI18n()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    const res = await fetch('/api/pedidos?status=active').then(r => r.json())
    // Solo mostrar pedidos confirmados o preparando
    const kitchenOrders = (res.orders || []).filter(
      (o: KitchenOrder) => ['confirmed', 'preparing', 'ready'].includes(o.status)
    )
    setOrders(kitchenOrders)
    setLoading(false)
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Auto-refresh cada 5 segundos (cocina necesita ser mas rapido)
  useEffect(() => {
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [loadOrders])

  const handleItemReady = async (orderId: string, itemId: string) => {
    await fetch(`/api/pedidos/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, status: 'ready' }),
    })
    loadOrders()
  }

  const handleStartPreparing = async (orderId: string) => {
    await fetch(`/api/pedidos/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'preparing' }),
    })
    loadOrders()
  }

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">{t.common.loading}</span>
      </div>
    )
  }

  const confirmed = orders.filter(o => o.status === 'confirmed')
  const preparing = orders.filter(o => o.status === 'preparing')
  const ready = orders.filter(o => o.status === 'ready')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-10 h-10 bg-red-50 ring-1 ring-red-100 rounded-xl flex items-center justify-center">
              <ChefHat className="text-red-500" size={20} />
            </span>
            {t.cocina.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {confirmed.length} {t.cocina.pending} — {preparing.length} {t.cocina.preparing} — {ready.length} {t.cocina.ready}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">En vivo</span>
          </div>
          <button onClick={loadOrders} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <ChefHat size={56} className="mx-auto mb-4 text-slate-200" />
          <h2 className="text-lg font-bold text-slate-600 mb-2">{t.cocina.noPending}</h2>
          <p className="text-sm text-slate-400">{t.cocina.subtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Nuevos pedidos primero, luego preparando, luego listos */}
          {[...confirmed, ...preparing, ...ready].map(order => {
            const timeSince = getTimeSince(order.created_at)
            const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
            const isUrgent = mins > 15
            const parsedItems: OrderItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items

            const allReady = parsedItems.every(i => i.status === 'ready')
            const someReady = parsedItems.some(i => i.status === 'ready')

            return (
              <div
                key={order.id}
                className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${
                  order.status === 'ready'
                    ? 'border-emerald-200 bg-emerald-50'
                    : order.status === 'preparing'
                    ? 'border-orange-200 bg-orange-50'
                    : isUrgent
                    ? 'border-red-200 bg-red-50 animate-pulse'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-800">#{order.order_number}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-600">
                        {order.table_name || (order.type === 'takeaway' ? t.pedidos.takeaway : t.pedidos.deliveryLabel)}
                      </p>
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${isUrgent ? 'text-red-600' : 'text-slate-400'}`}>
                        {isUrgent ? <Flame size={10} /> : <Clock size={10} />}
                        {timeSince}
                      </div>
                    </div>
                  </div>
                  {order.status === 'ready' && (
                    <div className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg">
                      <Bell size={12} /> <span className="text-xs font-bold">{t.cocina.ready.toUpperCase()}</span>
                    </div>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStartPreparing(order.id)}
                      className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      {t.cocina.markPreparing}
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="px-4 pb-4 space-y-1.5">
                  {parsedItems.map(item => {
                    const itemReady = item.status === 'ready'
                    const parsedExtras = typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          itemReady ? 'bg-emerald-100/50 line-through opacity-60' : 'bg-white/70'
                        }`}
                      >
                        <button
                          onClick={() => !itemReady && handleItemReady(order.id, item.id)}
                          disabled={itemReady}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            itemReady
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                          }`}
                        >
                          {itemReady ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{item.quantity}</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${itemReady ? 'text-slate-400' : 'text-slate-800'}`}>
                            {!itemReady && <span className="text-orange-600 mr-1">{item.quantity}x</span>}
                            {item.name}
                          </p>
                          {parsedExtras?.length > 0 && (
                            <p className="text-[10px] text-slate-400">+{parsedExtras.map((e: {name: string}) => e.name).join(', ')}</p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-red-600 font-bold uppercase">⚠ {item.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
