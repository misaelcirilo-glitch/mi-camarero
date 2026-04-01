'use client'

import { useState, useEffect } from 'react'
import {
  Shield, Euro, Users, TrendingUp, TrendingDown, Building2,
  Loader2, Crown, Clock, ShoppingCart, XCircle
} from 'lucide-react'

interface Metrics {
  mrr: number; activeSubs: number; trials: number; canceled: number; totalTenants: number; churnRate: string
}
interface Tenant {
  id: string; name: string; slug: string; email: string; subscription_status: string; created_at: string
  trial_ends_at: string; plan_name: string; price_monthly: number; staff_count: number
  menu_items: number; orders_total: number; revenue_total: number
}
interface DailyOrder { date: string; orders: number; revenue: number }

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  trial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Trial' },
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
  past_due: { bg: 'bg-red-100', text: 'text-red-700', label: 'Impago' },
  canceled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Cancelado' },
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [dailyOrders, setDailyOrders] = useState<DailyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin')
      .then(r => { if (!r.ok) throw new Error('No autorizado'); return r.json() })
      .then(data => { setMetrics(data.metrics); setTenants(data.tenants || []); setDailyOrders(data.dailyOrders || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-slate-400"><Loader2 size={22} className="animate-spin" /><span className="text-sm">Cargando admin...</span></div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-center"><Shield size={48} className="mx-auto mb-4 opacity-50" /><h2 className="font-bold text-lg mb-2">Acceso denegado</h2><p className="text-sm">{error}</p></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Shield className="text-slate-700" size={24} /> Super Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Panel global de la plataforma Mi Camarero</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'MRR', value: `${metrics?.mrr?.toFixed(0) || 0} EUR`, icon: Euro, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Activos', value: metrics?.activeSubs || 0, icon: Crown, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En trial', value: metrics?.trials || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Total restaurantes', value: metrics?.totalTenants || 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Churn rate', value: `${metrics?.churnRate || 0}%`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p><p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p></div>
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart (simple bar) */}
      {dailyOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Pedidos ultimos 30 dias</h2>
          <div className="flex items-end gap-1 h-32">
            {dailyOrders.slice(-30).map(d => {
              const maxOrders = Math.max(...dailyOrders.map(x => Number(x.orders)), 1)
              const height = (Number(d.orders) / maxOrders) * 100
              return (
                <div key={d.date} className="flex-1 group relative" title={`${d.date}: ${d.orders} pedidos, ${Number(d.revenue).toFixed(0)} EUR`}>
                  <div className="bg-orange-400 hover:bg-orange-500 rounded-t transition-colors" style={{ height: `${Math.max(height, 4)}%` }} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1">
            <span>{dailyOrders[0]?.date}</span>
            <span>{dailyOrders[dailyOrders.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Tenants table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Building2 size={18} className="text-purple-500" /> Restaurantes ({tenants.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Restaurante</th>
                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase">Plan</th>
                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Staff</th>
                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Platos</th>
                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Pedidos</th>
                <th className="p-3 text-right text-xs font-bold text-slate-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map(t => {
                const st = STATUS_STYLES[t.subscription_status] || STATUS_STYLES.trial
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{t.name}</p>
                      <p className="text-[10px] text-slate-400">/{t.slug} — {new Date(t.created_at).toLocaleDateString('es-ES')}</p>
                    </td>
                    <td className="p-3 text-center"><span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{t.plan_name}</span></td>
                    <td className="p-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.bg} ${st.text}`}>{st.label}</span></td>
                    <td className="p-3 text-center text-slate-600 hidden md:table-cell">{Number(t.staff_count)}</td>
                    <td className="p-3 text-center text-slate-600 hidden md:table-cell">{Number(t.menu_items)}</td>
                    <td className="p-3 text-center text-slate-600 hidden lg:table-cell">{Number(t.orders_total)}</td>
                    <td className="p-3 text-right font-bold text-slate-800">{Number(t.revenue_total).toFixed(0)} EUR</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
