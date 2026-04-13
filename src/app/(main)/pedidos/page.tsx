'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList, Clock, CheckCircle, ChefHat, Loader2,
  CreditCard, XCircle, RefreshCw, Utensils
} from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'

interface OrderItem {
  id: string
  name: string
  quantity: number
  unit_price: number
  extras: { name: string; price: number }[]
  notes: string | null
  status: string
}

interface Order {
  id: string
  order_number: number
  type: string
  status: string
  subtotal: number
  tax_amount: number
  total: number
  notes: string | null
  customer_name: string | null
  table_number: number | null
  table_name: string | null
  created_at: string
  items: OrderItem[]
}

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: 'paid',
}

export default function PedidosPage() {
  const { t, formatPrice, locale } = useI18n()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')
  const [refreshing, setRefreshing] = useState(false)

  const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    pending: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: t.dashboard.status.pending, icon: Clock },
    confirmed: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: t.dashboard.status.confirmed, icon: CheckCircle },
    preparing: { bg: 'bg-orange-50 border border-orange-200', text: 'text-orange-700', label: t.dashboard.status.preparing, icon: ChefHat },
    ready: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: t.dashboard.status.ready, icon: Utensils },
    served: { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', label: t.dashboard.status.served, icon: CheckCircle },
    paid: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: t.dashboard.status.paid, icon: CreditCard },
    cancelled: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', label: t.dashboard.status.cancelled, icon: XCircle },
  }

  const STATUSES = [
    { id: 'active', label: t.pedidos.all },
    { id: 'pending', label: t.dashboard.status.pending },
    { id: 'confirmed', label: t.dashboard.status.confirmed },
    { id: 'preparing', label: t.dashboard.status.preparing },
    { id: 'ready', label: t.dashboard.status.ready },
    { id: 'served', label: t.dashboard.status.served },
    { id: 'paid', label: t.dashboard.status.paid },
  ]

  const loadOrders = useCallback(async () => {
    const res = await fetch(`/api/pedidos?status=${filter}`).then(r => r.json())
    setOrders(res.orders || [])
    setLoading(false)
    setRefreshing(false)
  }, [filter])

  useEffect(() => { setLoading(true); loadOrders() }, [loadOrders])

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [loadOrders])

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return

    const extra: Record<string, string> = {}
    if (next === 'paid') {
      extra.payment_method = 'card'
    }

    await fetch(`/api/pedidos/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next, ...extra }),
    })
    loadOrders()
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm(t.pedidos.cancelOrder + '?')) return
    await fetch(`/api/pedidos/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    loadOrders()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">{t.common.loading}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-10 h-10 bg-blue-50 ring-1 ring-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-blue-500" size={20} />
            </span>
            {t.pedidos.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.pedidos.subtitle}</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadOrders() }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> {t.pedidos.newOrder}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {STATUSES.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-all ${
              filter === s.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <ClipboardList size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-700 mb-2">{t.pedidos.noOrders}</h2>
          <p className="text-sm text-slate-400">{t.pedidos.subtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const Icon = config.icon
            const next = NEXT_STATUS[order.status]
            const nextConfig = next ? STATUS_CONFIG[next] : null

            return (
              <div key={order.id} className={`rounded-2xl overflow-hidden transition-all shadow-sm ${config.bg}`}>
                {/* Order header */}
                <div className="p-4 border-b border-slate-100/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800">#{order.order_number}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-md border ${config.text} ${config.bg}`}>
                        <Icon size={12} /> {config.label}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {order.table_name && <span className="bg-white/70 px-2 py-0.5 rounded font-bold">{order.table_name}</span>}
                    <span className="bg-white/70 px-2 py-0.5 rounded">{order.type === 'dine_in' ? t.pedidos.dineIn : order.type === 'takeaway' ? t.pedidos.takeaway : t.pedidos.deliveryLabel}</span>
                    {order.customer_name && <span>{order.customer_name}</span>}
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2">
                  {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: OrderItem) => (
                    <div key={item.id} className="flex items-start justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">
                          <span className="font-bold text-orange-600 mr-1">{item.quantity}x</span>
                          {item.name}
                        </p>
                        {item.extras && (typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras).length > 0 && (
                          <p className="text-[10px] text-slate-400">
                            +{(typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras).map((e: {name: string}) => e.name).join(', ')}
                          </p>
                        )}
                        {item.notes && <p className="text-[10px] text-orange-500 italic">{item.notes}</p>}
                      </div>
                      <span className="text-xs font-bold tabular-nums text-slate-600 shrink-0 ml-2">
                        {formatPrice(Number(item.unit_price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.notes && <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2">{order.notes}</p>}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.pedidos.total}</span>
                    <span className="text-lg font-bold tabular-nums text-slate-900">{formatPrice(Number(order.total))}</span>
                  </div>
                  <div className="flex gap-2">
                    {next && nextConfig && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, order.status)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        <nextConfig.icon size={14} /> {nextConfig.label}
                      </button>
                    )}
                    {order.status !== 'paid' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="px-3 py-2.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
