'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Plus, Euro, TrendingUp, UserPlus, Loader2, Trash2, Edit2, X, Save, Trophy, Gift, Star } from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'

interface Customer {
  id: string; name: string; email: string | null; phone: string | null; points: number
  total_spent: number; visit_count: number; last_visit: string | null; notes: string | null; tags: string[]
}
interface Reward {
  id: string; name: string; description: string | null; points_required: number
  reward_type: string; reward_value: number | null; item_name: string | null
}
interface Stats { total: number; active_30d: number; total_revenue: number; avg_spent: number }

const REWARD_LABELS: Record<string, string> = { discount_percent: '% Descuento', discount_amount: 'EUR Descuento', free_item: 'Plato gratis' }

export default function ClientesPage() {
  const { t, formatPrice, locale } = useI18n()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('last_visit')
  const [tab, setTab] = useState<'crm' | 'loyalty'>('crm')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [showRewardForm, setShowRewardForm] = useState(false)
  const [rewardForm, setRewardForm] = useState({ name: '', points_required: 100, reward_type: 'discount_percent', reward_value: 10 })
  const [savingReward, setSavingReward] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editPoints, setEditPoints] = useState(0)

  const loadData = useCallback(async () => {
    const [cRes, rRes] = await Promise.all([
      fetch(`/api/clientes?q=${search}&sort=${sort}`).then(r => r.json()),
      fetch('/api/fidelizacion/recompensas').then(r => r.json()),
    ])
    setCustomers(cRes.customers || []); setStats(cRes.stats || null); setRewards(rRes.rewards || [])
    setLoading(false)
  }, [search, sort])

  useEffect(() => { loadData() }, [loadData])

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowAddCustomer(false); setForm({ name: '', email: '', phone: '', notes: '' }); setSaving(false); loadData()
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm(t.common.delete + '?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' }); loadData()
  }

  const handleUpdatePoints = async () => {
    if (!editingCustomer) return
    await fetch(`/api/clientes/${editingCustomer.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: editPoints }) })
    setEditingCustomer(null); loadData()
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingReward(true)
    await fetch('/api/fidelizacion/recompensas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rewardForm) })
    setShowRewardForm(false); setRewardForm({ name: '', points_required: 100, reward_type: 'discount_percent', reward_value: 10 }); setSavingReward(false); loadData()
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm(t.common.delete + '?')) return
    await fetch(`/api/fidelizacion/recompensas/${id}`, { method: 'DELETE' }); loadData()
  }

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-slate-400"><Loader2 size={22} className="animate-spin" /><span className="text-sm font-medium">{t.common.loading}</span></div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-10 h-10 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center">
              <Users className="text-emerald-500" size={20} />
            </span>
            {t.clientes.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.clientes.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.clientes.title, value: stats?.total || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
          { label: 'Activos (30d)', value: stats?.active_30d || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
          { label: t.clientes.totalSpent, value: formatPrice(Number(stats?.total_revenue || 0)), icon: Euro, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
          { label: 'Gasto medio', value: formatPrice(Number(stats?.avg_spent || 0)), icon: Star, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p><p className={`text-2xl font-bold tabular-nums mt-1 ${s.color}`}>{s.value}</p></div>
              <div className={`w-10 h-10 ${s.bg} ring-1 ${s.ring} rounded-xl flex items-center justify-center`}><s.icon size={20} className={s.color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('crm')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'crm' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Users size={14} className="inline mr-1.5" /> {t.clientes.title}
        </button>
        <button onClick={() => setTab('loyalty')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'loyalty' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Trophy size={14} className="inline mr-1.5" /> Recompensas
        </button>
      </div>

      {tab === 'crm' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.clientes.search}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
              <option value="last_visit">{t.clientes.lastVisit}</option>
              <option value="total_spent">{t.clientes.totalSpent}</option>
              <option value="points">{t.clientes.points}</option>
              <option value="visit_count">{t.clientes.totalOrders}</option>
              <option value="name">{t.config.name}</option>
            </select>
            <button onClick={() => setShowAddCustomer(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-sm transition-colors">
              <UserPlus size={16} /> {t.common.add}
            </button>
          </div>

          {showAddCustomer && (
            <form onSubmit={handleAddCustomer} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-3 items-end">
              <div className="flex-1"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.config.name} *</label>
                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" /></div>
              <div className="flex-1"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" /></div>
              <div className="w-36"><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefono</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" /></div>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 shadow-sm transition-colors">{saving ? '...' : t.common.save}</button>
              <button type="button" onClick={() => setShowAddCustomer(false)} className="px-3 py-2.5 text-slate-400 hover:text-slate-600">{t.common.cancel}</button>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.clientes.title}</th>
                  <th className="p-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="p-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.clientes.points}</th>
                  <th className="p-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">{t.clientes.totalOrders}</th>
                  <th className="p-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.clientes.totalSpent}</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400"><Users size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">{t.clientes.noCustomers}</p></td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3"><p className="font-semibold text-slate-800">{c.name}</p>
                      {c.last_visit && <p className="text-[10px] text-slate-400">{t.clientes.lastVisit}: {new Date(c.last_visit).toLocaleDateString(locale)}</p>}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {c.email && <p className="text-xs text-blue-600">{c.email}</p>}
                      {c.phone && <p className="text-xs text-slate-500">{c.phone}</p>}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => { setEditingCustomer(c); setEditPoints(c.points) }} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-xs font-bold hover:bg-purple-100 transition-colors">
                        <Trophy size={12} /> {c.points}
                      </button>
                    </td>
                    <td className="p-3 text-center text-slate-600 font-medium hidden sm:table-cell">{c.visit_count}</td>
                    <td className="p-3 text-right font-bold tabular-nums text-slate-800">{formatPrice(Number(c.total_spent))}</td>
                    <td className="p-3"><button onClick={() => handleDeleteCustomer(c.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'loyalty' && (
        <div className="space-y-4">
          <button onClick={() => setShowRewardForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-sm transition-colors">
            <Plus size={16} /> {t.common.add}
          </button>

          {showRewardForm && (
            <form onSubmit={handleAddReward} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.config.name}</label>
                  <input type="text" required value={rewardForm.name} onChange={e => setRewardForm(p => ({ ...p, name: e.target.value }))} placeholder="Cafe gratis, 10% descuento..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" /></div>
                <div><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.clientes.points}</label>
                  <input type="number" min="1" value={rewardForm.points_required} onChange={e => setRewardForm(p => ({ ...p, points_required: parseInt(e.target.value) || 100 }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo</label>
                  <select value={rewardForm.reward_type} onChange={e => setRewardForm(p => ({ ...p, reward_type: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                    <option value="discount_percent">% Descuento</option><option value="discount_amount">EUR Descuento</option><option value="free_item">Plato gratis</option>
                  </select></div>
                <div><label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor</label>
                  <input type="number" min="0" step="0.01" value={rewardForm.reward_value} onChange={e => setRewardForm(p => ({ ...p, reward_value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" /></div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={savingReward} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 shadow-sm transition-colors">{savingReward ? '...' : t.common.save}</button>
                <button type="button" onClick={() => setShowRewardForm(false)} className="px-4 py-2.5 text-slate-400 hover:text-slate-600">{t.common.cancel}</button>
              </div>
            </form>
          )}

          {rewards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <Gift size={48} className="mx-auto mb-4 text-slate-300" /><h2 className="text-lg font-bold text-slate-700 mb-2">{t.clientes.noCustomers}</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">Crea recompensas como "Cafe gratis a los 50 puntos" o "10% descuento a los 100 puntos" para fidelizar clientes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-purple-50 ring-1 ring-purple-100 rounded-xl flex items-center justify-center"><Gift size={20} className="text-purple-600" /></div>
                    <button onClick={() => handleDeleteReward(r.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <h3 className="font-bold text-slate-800 mt-3">{r.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2.5 py-1 rounded-md">{r.points_required} pts</span>
                    <span className="text-xs text-slate-500">{REWARD_LABELS[r.reward_type]} {r.reward_value}</span>
                  </div>
                  {r.description && <p className="text-xs text-slate-400 mt-2">{r.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit points modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">{t.clientes.points} - {editingCustomer.name}</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <input type="number" min="0" value={editPoints} onChange={e => setEditPoints(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-2xl font-bold text-center text-purple-700 mb-4 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            <div className="flex gap-2">
              <button onClick={() => setEditingCustomer(null)} className="flex-1 py-2.5 rounded-lg font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">{t.common.cancel}</button>
              <button onClick={handleUpdatePoints} className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-sm transition-colors">{t.common.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
