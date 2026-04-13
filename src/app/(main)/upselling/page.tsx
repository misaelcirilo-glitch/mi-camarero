'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles, Plus, Trash2, Loader2, ArrowRight, Clock, Zap, TrendingUp,
  Gift, Star, ToggleLeft, ToggleRight
} from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'

interface MenuItem { id: string; name: string; price: number; category_name?: string }
interface UpsellRule {
  id: string; type: string; discount_percent: number; message: string | null; active: boolean; priority: number
  trigger_name: string; trigger_price: number; suggest_name: string; suggest_price: number
}
interface TimeHighlight {
  id: string; menu_item_id: string; item_name: string; item_price: number
  day_of_week: number[]; start_hour: string; end_hour: string; label: string | null
}

const TYPES = [
  { id: 'complement', label: 'Complemento', icon: Plus, desc: 'Sugerir algo que acompane', color: 'text-blue-600' },
  { id: 'upgrade', label: 'Mejora', icon: TrendingUp, desc: 'Mejorar lo que pidio', color: 'text-green-600' },
  { id: 'combo', label: 'Combo', icon: Gift, desc: 'Oferta especial juntos', color: 'text-purple-600' },
]

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export default function UpsellingPage() {
  const { t, formatPrice } = useI18n()
  const [rules, setRules] = useState<UpsellRule[]>([])
  const [highlights, setHighlights] = useState<TimeHighlight[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'rules' | 'highlights'>('rules')

  // Rule form
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [ruleForm, setRuleForm] = useState({ trigger_item_id: '', suggest_item_id: '', type: 'complement', discount_percent: 0, message: '' })
  const [savingRule, setSavingRule] = useState(false)

  // Highlight form
  const [showHighlightForm, setShowHighlightForm] = useState(false)
  const [hlForm, setHlForm] = useState({ menu_item_id: '', day_of_week: [1, 2, 3, 4, 5] as number[], start_hour: '12:00', end_hour: '16:00', label: '' })
  const [savingHl, setSavingHl] = useState(false)

  const loadData = useCallback(async () => {
    const [rulesRes, hlRes, itemsRes] = await Promise.all([
      fetch('/api/upselling/reglas').then(r => r.json()),
      fetch('/api/upselling/highlights').then(r => r.json()),
      fetch('/api/carta/platos').then(r => r.json()),
    ])
    setRules(rulesRes.rules || [])
    setHighlights(hlRes.highlights || [])
    setMenuItems((itemsRes.items || []).map((i: MenuItem & { category_name?: string }) => ({ id: i.id, name: i.name, price: i.price, category_name: i.category_name })))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRule(true)
    await fetch('/api/upselling/reglas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleForm),
    })
    setShowRuleForm(false)
    setRuleForm({ trigger_item_id: '', suggest_item_id: '', type: 'complement', discount_percent: 0, message: '' })
    setSavingRule(false)
    loadData()
  }

  const handleToggleRule = async (id: string, active: boolean) => {
    await fetch(`/api/upselling/reglas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    loadData()
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm(t.common.delete + '?')) return
    await fetch(`/api/upselling/reglas/${id}`, { method: 'DELETE' })
    loadData()
  }

  const handleCreateHighlight = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingHl(true)
    await fetch('/api/upselling/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hlForm),
    })
    setShowHighlightForm(false)
    setHlForm({ menu_item_id: '', day_of_week: [1, 2, 3, 4, 5], start_hour: '12:00', end_hour: '16:00', label: '' })
    setSavingHl(false)
    loadData()
  }

  const handleDeleteHighlight = async (id: string) => {
    if (!confirm(t.common.delete + '?')) return
    await fetch(`/api/upselling/highlights/${id}`, { method: 'DELETE' })
    loadData()
  }

  const toggleDay = (day: number) => {
    setHlForm(p => ({
      ...p,
      day_of_week: p.day_of_week.includes(day) ? p.day_of_week.filter(d => d !== day) : [...p.day_of_week, day].sort()
    }))
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 gap-3 text-slate-400"><Loader2 size={22} className="animate-spin" /><span className="text-sm font-medium">{t.common.loading}</span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={24} /> {t.upselling.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.upselling.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase">{t.upselling.active}</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{rules.filter(r => r.active).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase">Highlights</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{highlights.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase">{t.carta.title}</p>
          <p className="text-2xl font-black text-slate-700 mt-1">{menuItems.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('rules')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'rules' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white text-slate-600 border border-slate-200'}`}>
          <Zap size={14} className="inline mr-1.5" /> {t.upselling.title}
        </button>
        <button onClick={() => setTab('highlights')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'highlights' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-600 border border-slate-200'}`}>
          <Clock size={14} className="inline mr-1.5" /> Highlights
        </button>
      </div>

      {/* RULES TAB */}
      {tab === 'rules' && (
        <div className="space-y-4">
          <button onClick={() => setShowRuleForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30">
            <Plus size={16} /> {t.upselling.addRule}
          </button>

          {showRuleForm && (
            <form onSubmit={handleCreateRule} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.upselling.when}...</label>
                  <select required value={ruleForm.trigger_item_id} onChange={e => setRuleForm(p => ({ ...p, trigger_item_id: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
                    <option value="">Seleccionar plato</option>
                    {menuItems.map(i => <option key={i.id} value={i.id}>{i.name} ({formatPrice(Number(i.price))})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.upselling.suggest}...</label>
                  <select required value={ruleForm.suggest_item_id} onChange={e => setRuleForm(p => ({ ...p, suggest_item_id: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
                    <option value="">Seleccionar plato</option>
                    {menuItems.filter(i => i.id !== ruleForm.trigger_item_id).map(i => <option key={i.id} value={i.id}>{i.name} ({formatPrice(Number(i.price))})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                  <select value={ruleForm.type} onChange={e => setRuleForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
                    {TYPES.map(tp => <option key={tp.id} value={tp.id}>{tp.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descuento %</label>
                  <input type="number" min="0" max="100" value={ruleForm.discount_percent}
                    onChange={e => setRuleForm(p => ({ ...p, discount_percent: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensaje</label>
                  <input type="text" value={ruleForm.message} placeholder="Acompana con..."
                    onChange={e => setRuleForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={savingRule} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
                  {savingRule ? t.common.loading : t.common.save}
                </button>
                <button type="button" onClick={() => setShowRuleForm(false)} className="px-4 py-2.5 text-slate-400 hover:text-slate-600">{t.common.cancel}</button>
              </div>
            </form>
          )}

          {rules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <Zap size={48} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">{t.upselling.noRules}</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">{t.upselling.subtitle}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => {
                const typeInfo = TYPES.find(tp => tp.id === rule.type)
                return (
                  <div key={rule.id} className={`bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 ${!rule.active ? 'opacity-50' : ''}`}>
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <span className="text-sm font-bold text-slate-800 truncate">{rule.trigger_name}</span>
                      <ArrowRight size={14} className="text-slate-300 shrink-0" />
                      <span className="text-sm font-bold text-purple-700 truncate">{rule.suggest_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 ${typeInfo?.color || 'text-slate-600'}`}>{typeInfo?.label}</span>
                      {rule.discount_percent > 0 && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-{rule.discount_percent}%</span>}
                      {rule.message && <span className="text-xs text-slate-400 italic truncate hidden lg:block">"{rule.message}"</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggleRule(rule.id, rule.active)} className="text-slate-400 hover:text-purple-600 transition-colors">
                        {rule.active ? <ToggleRight size={22} className="text-purple-600" /> : <ToggleLeft size={22} />}
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* HIGHLIGHTS TAB */}
      {tab === 'highlights' && (
        <div className="space-y-4">
          <button onClick={() => setShowHighlightForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
            <Plus size={16} /> {t.common.add}
          </button>

          {showHighlightForm && (
            <form onSubmit={handleCreateHighlight} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plato a destacar</label>
                <select required value={hlForm.menu_item_id} onChange={e => setHlForm(p => ({ ...p, menu_item_id: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200">
                  <option value="">Seleccionar plato</option>
                  {menuItems.map(i => <option key={i.id} value={i.id}>{i.name} ({formatPrice(Number(i.price))})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dias</label>
                <div className="flex gap-2">
                  {DAYS.map((d, i) => (
                    <button key={i} type="button" onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${hlForm.day_of_week.includes(i) ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
                  <input type="time" value={hlForm.start_hour} onChange={e => setHlForm(p => ({ ...p, start_hour: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
                  <input type="time" value={hlForm.end_hour} onChange={e => setHlForm(p => ({ ...p, end_hour: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Etiqueta</label>
                  <input type="text" value={hlForm.label} placeholder="Happy Hour, Menu del dia..."
                    onChange={e => setHlForm(p => ({ ...p, label: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={savingHl} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
                  {savingHl ? t.common.loading : t.common.save}
                </button>
                <button type="button" onClick={() => setShowHighlightForm(false)} className="px-4 py-2.5 text-slate-400 hover:text-slate-600">{t.common.cancel}</button>
              </div>
            </form>
          )}

          {highlights.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <Clock size={48} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">{t.upselling.noRules}</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">{t.upselling.subtitle}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {highlights.map(hl => (
                <div key={hl.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <Star size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800">{hl.item_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{hl.start_hour} - {hl.end_hour}</span>
                      <span className="flex gap-0.5">{hl.day_of_week.map(d => <span key={d} className="bg-slate-100 px-1 rounded text-[9px] font-bold">{DAYS[d]}</span>)}</span>
                      {hl.label && <span className="text-orange-500 font-medium">{hl.label}</span>}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-700 shrink-0">{formatPrice(Number(hl.item_price))}</span>
                  <button onClick={() => handleDeleteHighlight(hl.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
