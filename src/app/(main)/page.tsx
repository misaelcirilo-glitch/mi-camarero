'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardList, Euro, Flame, Grid3X3,
  UtensilsCrossed, Clock, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  stats: {
    ordersToday: number
    revenueToday: number
    activeOrders: number
    tablesOccupied: number
    tablesTotal: number
    menuItems: number
  }
  recentOrders: Array<{
    id: string
    order_number: number
    type: string
    status: string
    total: number
    created_at: string
    table_number: number | null
    table_name: string | null
  }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  served: 'bg-slate-100 text-slate-600',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  served: 'Servido',
  paid: 'Pagado',
  cancelled: 'Cancelado',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const s = data?.stats

  const cards = [
    { label: 'Pedidos hoy', value: s?.ordersToday || 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Facturado hoy', value: `${(s?.revenueToday || 0).toFixed(2)} EUR`, icon: Euro, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pedidos activos', value: s?.activeOrders || 0, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Mesas ocupadas', value: `${s?.tablesOccupied || 0} / ${s?.tablesTotal || 0}`, icon: Grid3X3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Vista general de tu restaurante hoy</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{card.label}</p>
                <p className={`text-2xl font-black mt-2 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-4">Acciones rapidas</h2>
          <div className="space-y-3">
            {[
              { href: '/carta', label: 'Gestionar carta', desc: `${s?.menuItems || 0} platos`, icon: UtensilsCrossed, color: 'bg-orange-500' },
              { href: '/pedidos', label: 'Ver pedidos', desc: `${s?.activeOrders || 0} activos`, icon: ClipboardList, color: 'bg-blue-500' },
              { href: '/mesas', label: 'Mapa de mesas', desc: `${s?.tablesTotal || 0} mesas`, icon: Grid3X3, color: 'bg-purple-500' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                  <action.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">{action.label}</p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Pedidos recientes</h2>
            <Link href="/pedidos" className="text-xs font-bold text-orange-500 hover:underline">
              Ver todos
            </Link>
          </div>

          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-bold text-sm">
                    #{order.order_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700">
                      {order.table_name || (order.type === 'takeaway' ? 'Para llevar' : 'Delivery')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      {new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{Number(order.total).toFixed(2)} EUR</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Aun no hay pedidos</p>
              <p className="text-xs mt-1">Los pedidos apareceran aqui en tiempo real</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
