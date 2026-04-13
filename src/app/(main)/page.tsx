'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardList, Wallet, Flame, Grid3X3,
  UtensilsCrossed, Clock, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/shared/lib/i18n'

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
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  preparing: 'bg-orange-50 text-orange-700 border border-orange-200',
  ready: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  served: 'bg-slate-50 text-slate-600 border border-slate-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

export default function DashboardPage() {
  const { t, formatPrice, locale } = useI18n()
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
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-28" />
          ))}
        </div>
      </div>
    )
  }

  const s = data?.stats
  const statusLabels = t.dashboard.status as Record<string, string>

  const cards = [
    { label: t.dashboard.ordersToday, value: s?.ordersToday || 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-1 ring-blue-100' },
    { label: t.dashboard.revenueToday, value: formatPrice(s?.revenueToday || 0), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-1 ring-emerald-100' },
    { label: t.dashboard.activeOrders, value: s?.activeOrders || 0, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-1 ring-orange-100' },
    { label: t.dashboard.tablesOccupied, value: `${s?.tablesOccupied || 0} / ${s?.tablesTotal || 0}`, icon: Grid3X3, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-1 ring-purple-100' },
  ]

  const dateLocales: Record<string, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.bg} ${card.ring} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{t.dashboard.quickActions}</h2>
          <div className="space-y-2">
            {[
              { href: '/carta', label: t.dashboard.manageMenu, desc: `${s?.menuItems || 0} ${t.dashboard.dishes}`, icon: UtensilsCrossed, color: 'bg-orange-500' },
              { href: '/pedidos', label: t.dashboard.viewOrders, desc: `${s?.activeOrders || 0} ${t.dashboard.active}`, icon: ClipboardList, color: 'bg-blue-500' },
              { href: '/mesas', label: t.dashboard.tableMap, desc: `${s?.tablesTotal || 0} ${t.dashboard.tables}`, icon: Grid3X3, color: 'bg-purple-500' },
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
                  <p className="text-sm font-semibold text-slate-700">{action.label}</p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">{t.dashboard.recentOrders}</h2>
            <Link href="/pedidos" className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
              {t.dashboard.viewAll}
            </Link>
          </div>

          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {data.recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-sm">
                    #{order.order_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {order.table_name || (order.type === 'takeaway' ? t.dashboard.takeaway : t.dashboard.delivery)}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock size={11} />
                      {new Date(order.created_at).toLocaleTimeString(dateLocales[locale], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  <span className="text-sm font-bold text-slate-700 tabular-nums">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">{t.dashboard.noOrders}</p>
              <p className="text-xs mt-1 text-slate-300">{t.dashboard.noOrdersDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
