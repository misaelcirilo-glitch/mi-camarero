'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Star, Clock } from 'lucide-react'
import { MenuItem, MenuItemExtra, MenuCategory, ALLERGENS, TAGS } from '../types'

interface PlatoModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => Promise<void>
  item?: MenuItem | null
  categories: MenuCategory[]
}

export default function PlatoModal({ open, onClose, onSave, item, categories }: PlatoModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    allergens: [] as string[],
    tags: [] as string[],
    calories: '',
    prep_time_min: 15,
    featured: false,
    extras: [] as { name: string; price: number }[],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category_id: item.category_id || '',
        allergens: item.allergens || [],
        tags: item.tags || [],
        calories: item.calories?.toString() || '',
        prep_time_min: item.prep_time_min,
        featured: item.featured,
        extras: (item.extras || []).map(e => ({ name: e.name, price: e.price })),
      })
    } else {
      setForm({
        name: '', description: '', price: 0, category_id: categories[0]?.id || '',
        allergens: [], tags: [], calories: '', prep_time_min: 15, featured: false, extras: [],
      })
    }
  }, [item, open, categories])

  if (!open) return null

  const toggleAllergen = (id: string) => {
    setForm(p => ({
      ...p,
      allergens: p.allergens.includes(id) ? p.allergens.filter(a => a !== id) : [...p.allergens, id],
    }))
  }

  const toggleTag = (id: string) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(id) ? p.tags.filter(t => t !== id) : [...p.tags, id],
    }))
  }

  const addExtra = () => setForm(p => ({ ...p, extras: [...p.extras, { name: '', price: 0 }] }))
  const removeExtra = (i: number) => setForm(p => ({ ...p, extras: p.extras.filter((_, idx) => idx !== i) }))
  const updateExtra = (i: number, field: 'name' | 'price', val: string | number) => {
    setForm(p => ({
      ...p,
      extras: p.extras.map((e, idx) => idx === i ? { ...e, [field]: val } : e),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        calories: form.calories ? Number(form.calories) : null,
        category_id: form.category_id || null,
        extras: form.extras.filter(e => e.name.trim()),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{item ? 'Editar plato' : 'Nuevo plato'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Nombre y precio */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Nombre</label>
              <input
                type="text" required value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Ej: Paella Valenciana"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Precio (EUR)</label>
              <input
                type="number" required min="0" step="0.01" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Descripcion</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none h-20"
              placeholder="Arroz con verduras, pollo, mariscos y azafran..."
            />
          </div>

          {/* Categoria + meta */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Categoria</label>
              <select
                value={form.category_id}
                onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Sin categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Clock size={12} /> Tiempo (min)
              </label>
              <input
                type="number" min="1" value={form.prep_time_min}
                onChange={e => setForm(p => ({ ...p, prep_time_min: parseInt(e.target.value) || 15 }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Calorias</label>
              <input
                type="number" min="0" value={form.calories}
                onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* Destacado */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.featured ? 'bg-orange-500 justify-end' : 'bg-slate-200 justify-start'}`}>
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} className={form.featured ? 'text-orange-500' : 'text-slate-300'} />
              <span className="text-sm font-medium text-slate-700">Plato destacado</span>
            </div>
          </label>

          {/* Alergenos */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Alergenos</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(a => (
                <button
                  key={a.id} type="button"
                  onClick={() => toggleAllergen(a.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    form.allergens.includes(a.id)
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button
                  key={t.id} type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    form.tags.includes(t.id)
                      ? `${t.color} border-current`
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Extras / Complementos</label>
              <button type="button" onClick={addExtra} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600">
                <Plus size={14} /> Anadir extra
              </button>
            </div>
            {form.extras.length > 0 && (
              <div className="space-y-2">
                {form.extras.map((extra, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text" value={extra.name}
                      onChange={e => updateExtra(i, 'name', e.target.value)}
                      placeholder="Ej: Extra queso"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <input
                      type="number" min="0" step="0.01" value={extra.price}
                      onChange={e => updateExtra(i, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="EUR"
                      className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <button type="button" onClick={() => removeExtra(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/30">
            {saving ? 'Guardando...' : item ? 'Guardar cambios' : 'Crear plato'}
          </button>
        </div>
      </form>
    </div>
  )
}
