'use client'

import { useState, useEffect } from 'react'
import { Grid3X3, Plus, QrCode, Users, Loader2, Copy, CheckCircle, Trash2 } from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'

interface Table {
  id: string
  number: number
  name: string
  capacity: number
  zone: string
  status: string
  current_order_id: string | null
  order_status: string | null
  order_total: number | null
}

const ZONES = [
  { id: 'interior', label: 'Interior', icon: '🏠' },
  { id: 'terraza', label: 'Terraza', icon: '☀️' },
  { id: 'barra', label: 'Barra', icon: '🍺' },
  { id: 'privado', label: 'Privado', icon: '🔒' },
]

export default function MesasPage() {
  const { t, formatPrice } = useI18n()

  const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    free: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: t.mesas.free },
    occupied: { bg: 'bg-orange-50 border border-orange-200', text: 'text-orange-700', label: t.mesas.occupied },
    reserved: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: t.mesas.reserved },
    bill_requested: { bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-700', label: 'Cuenta pedida' },
  }

  const [tables, setTables] = useState<Table[]>([])
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTable, setNewTable] = useState({ name: '', capacity: 4, zone: 'interior' })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    const res = await fetch('/api/mesas').then(r => r.json())
    setTables(res.tables || [])
    setSlug(res.slug || '')
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const getQRUrl = (tableNum: number) => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/r/${slug}?mesa=${tableNum}`
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1
    await fetch('/api/mesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: nextNumber, ...newTable, name: newTable.name || `Mesa ${nextNumber}` }),
    })
    setShowAddForm(false)
    setNewTable({ name: '', capacity: 4, zone: 'interior' })
    setSaving(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">{t.common.loading}</span>
      </div>
    )
  }

  const byZone = ZONES.map(z => ({
    zone: z,
    tables: tables.filter(t => t.zone === z.id),
  })).filter(g => g.tables.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-10 h-10 bg-purple-50 ring-1 ring-purple-100 rounded-xl flex items-center justify-center">
              <Grid3X3 className="text-purple-500" size={20} />
            </span>
            {t.mesas.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {tables.length} {t.mesas.title.toLowerCase()} — {tables.filter(t => t.status === 'free').length} {t.mesas.free.toLowerCase()}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus size={16} /> {t.mesas.addTable}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleAddTable} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.config.name}</label>
            <input
              type="text" value={newTable.name}
              onChange={e => setNewTable(p => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Terraza 1"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="w-24">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.mesas.capacity}</label>
            <input
              type="number" min="1" value={newTable.capacity}
              onChange={e => setNewTable(p => ({ ...p, capacity: parseInt(e.target.value) || 4 }))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zona</label>
            <select
              value={newTable.zone}
              onChange={e => setNewTable(p => ({ ...p, zone: e.target.value }))}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            >
              {ZONES.map(z => <option key={z.id} value={z.id}>{z.icon} {z.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 shadow-sm transition-colors">
            {saving ? t.common.loading : t.common.save}
          </button>
          <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 text-slate-400 hover:text-slate-600">{t.common.cancel}</button>
        </form>
      )}

      {/* Tables grid by zone */}
      {byZone.map(({ zone, tables: zoneTables }) => (
        <div key={zone.id}>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>{zone.icon}</span> {zone.label}
            <span className="text-[11px] text-slate-300 font-bold">({zoneTables.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {zoneTables.map(table => {
              const style = STATUS_STYLES[table.status] || STATUS_STYLES.free
              return (
                <div
                  key={table.id}
                  className={`rounded-2xl p-4 transition-all hover:shadow-sm ${style.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-slate-800">#{table.number}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${style.text}`}>{style.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{table.name}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <Users size={12} /> {table.capacity} {t.mesas.persons}
                  </div>

                  {table.order_total && (
                    <p className="text-xs font-bold tabular-nums text-slate-700 mb-2">
                      {t.pedidos.total}: {formatPrice(Number(table.order_total))}
                    </p>
                  )}

                  <button
                    onClick={() => setShowQR(showQR === table.id ? null : table.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/80 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white hover:border-orange-300 hover:text-orange-600 transition-all"
                  >
                    <QrCode size={14} /> Ver QR
                  </button>

                  {showQR === table.id && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-100 text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getQRUrl(table.number))}`}
                        alt={`QR Mesa ${table.number}`}
                        className="w-full aspect-square rounded-lg mb-2"
                      />
                      <p className="text-[9px] text-slate-400 mb-2 break-all">{getQRUrl(table.number)}</p>
                      <button
                        onClick={() => handleCopy(getQRUrl(table.number))}
                        className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        {copied ? <><CheckCircle size={12} className="text-emerald-500" /> Copiado</> : <><Copy size={12} /> Copiar enlace</>}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {tables.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Grid3X3 size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-700 mb-2">{t.mesas.subtitle}</h2>
          <p className="text-sm text-slate-400 mb-4">{t.mesas.addTable}</p>
        </div>
      )}
    </div>
  )
}
