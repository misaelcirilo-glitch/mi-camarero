'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  UtensilsCrossed, Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight,
  Star, Eye, EyeOff, Loader2, FolderPlus, GripVertical
} from 'lucide-react'
import PlatoModal from '@/features/carta/components/plato-modal'
import { MenuCategory, MenuItem, ALLERGENS, TAGS } from '@/features/carta/types'
import { useI18n } from '@/shared/lib/i18n'

export default function CartaPage() {
  const { t, formatPrice } = useI18n()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryIcon, setCategoryIcon] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [catRes, itemRes] = await Promise.all([
      fetch('/api/carta/categorias').then(r => r.json()),
      fetch('/api/carta/platos').then(r => r.json()),
    ])
    setCategories(catRes.categories || [])
    setItems(itemRes.items || [])
    setExpandedCategories(new Set((catRes.categories || []).map((c: MenuCategory) => c.id)))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return
    setSavingCategory(true)
    await fetch('/api/carta/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName, icon: categoryIcon || null }),
    })
    setCategoryName('')
    setCategoryIcon('')
    setShowCategoryForm(false)
    setSavingCategory(false)
    loadData()
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t.carta.deleteCategory + '?')) return
    await fetch(`/api/carta/categorias/${id}`, { method: 'DELETE' })
    loadData()
  }

  const handleSavePlato = async (data: Record<string, unknown>) => {
    if (editingItem) {
      await fetch(`/api/carta/platos/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/carta/platos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    loadData()
  }

  const handleDeletePlato = async (id: string) => {
    if (!confirm(t.carta.deleteDish + '?')) return
    await fetch(`/api/carta/platos/${id}`, { method: 'DELETE' })
    loadData()
  }

  const handleToggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/carta/platos/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available }),
    })
    loadData()
  }

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !selectedCategory || item.category_id === selectedCategory
    return matchSearch && matchCategory
  })

  const uncategorized = filtered.filter(i => !i.category_id)
  const grouped = categories.map(c => ({
    category: c,
    items: filtered.filter(i => i.category_id === c.id),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">{t.carta.saving}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="text-orange-500" size={24} />
            {t.carta.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} {t.carta.noDishes === 'Sin platos' ? 'platos' : 'platos'} en {categories.length} categorias</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FolderPlus size={16} /> {t.carta.addCategory}
          </button>
          <button
            onClick={() => { setEditingItem(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
          >
            <Plus size={16} /> {t.carta.addDish}
          </button>
        </div>
      </div>

      {/* Category form inline */}
      {showCategoryForm && (
        <form onSubmit={handleCreateCategory} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3 items-end">
          <div className="w-20">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Icono</label>
            <input
              type="text" value={categoryIcon} maxLength={2}
              onChange={e => setCategoryIcon(e.target.value)}
              placeholder="🍕"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.carta.categoryName}</label>
            <input
              type="text" required value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Ej: Entrantes, Carnes, Postres..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              autoFocus
            />
          </div>
          <button type="submit" disabled={savingCategory} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
            {savingCategory ? t.carta.saving : t.carta.save}
          </button>
          <button type="button" onClick={() => setShowCategoryForm(false)} className="px-4 py-2.5 text-slate-400 hover:text-slate-600">
            {t.carta.cancel}
          </button>
        </form>
      )}

      {/* Search + filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar plato..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-all ${
                !selectedCategory ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t.pedidos.all}
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-all ${
                  selectedCategory === c.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items by category */}
      <div className="space-y-4">
        {grouped.map(({ category, items: catItems }) => (
          <div key={category.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => toggleExpand(category.id)}
            >
              <div className="flex items-center gap-3">
                {expandedCategories.has(category.id) ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                <span className="text-lg">{category.icon}</span>
                <h3 className="font-bold text-slate-800 text-sm">{category.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{catItems.length}</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteCategory(category.id) }}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {expandedCategories.has(category.id) && (
              <div className="divide-y divide-slate-50">
                {catItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    {t.carta.noDishes}.{' '}
                    <button onClick={() => { setEditingItem(null); setModalOpen(true) }} className="text-orange-500 font-bold hover:underline">
                      {t.carta.addDish}
                    </button>
                  </div>
                ) : catItems.map(item => (
                  <ItemRow
                    key={item.id} item={item}
                    onEdit={() => { setEditingItem(item); setModalOpen(true) }}
                    onDelete={() => handleDeletePlato(item.id)}
                    onToggle={() => handleToggleAvailable(item)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-600 text-sm">Sin categoria ({uncategorized.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {uncategorized.map(item => (
                <ItemRow
                  key={item.id} item={item}
                  onEdit={() => { setEditingItem(item); setModalOpen(true) }}
                  onDelete={() => handleDeletePlato(item.id)}
                  onToggle={() => handleToggleAvailable(item)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <UtensilsCrossed size={48} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">{t.carta.noDishes}</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              {t.carta.subtitle}
            </p>
            <button
              onClick={() => { setEditingItem(null); setModalOpen(true) }}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              {t.carta.addDish}
            </button>
          </div>
        )}
      </div>

      <PlatoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSave={handleSavePlato}
        item={editingItem}
        categories={categories}
      />
    </div>
  )
}

function ItemRow({ item, onEdit, onDelete, onToggle, formatPrice }: {
  item: MenuItem; onEdit: () => void; onDelete: () => void; onToggle: () => void; formatPrice: (n: number) => string
}) {
  return (
    <div className={`flex items-center gap-4 px-5 py-3 group hover:bg-slate-50/50 transition-colors ${!item.available ? 'opacity-50' : ''}`}>
      <div className="text-slate-200 cursor-grab"><GripVertical size={16} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
          {item.featured && <Star size={14} className="text-orange-400 fill-orange-400 shrink-0" />}
          {!item.available && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Oculto</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {item.description && <p className="text-xs text-slate-400 truncate max-w-xs">{item.description}</p>}
          {item.allergens?.length > 0 && (
            <div className="flex gap-0.5">
              {item.allergens.map(a => {
                const allergen = ALLERGENS.find(al => al.id === a)
                return allergen ? <span key={a} className="text-xs" title={allergen.label}>{allergen.icon}</span> : null
              })}
            </div>
          )}
          {item.tags?.length > 0 && (
            <div className="flex gap-1">
              {item.tags.map(tg => {
                const tag = TAGS.find(t => t.id === tg)
                return tag ? <span key={tg} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tag.color}`}>{tag.label}</span> : null
              })}
            </div>
          )}
        </div>
      </div>
      <p className="font-black text-slate-900 text-sm whitespace-nowrap">{formatPrice(Number(item.price))}</p>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onToggle} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title={item.available ? 'Ocultar' : 'Mostrar'}>
          {item.available ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button onClick={onEdit} className="p-1.5 hover:bg-orange-50 rounded-lg text-slate-400 hover:text-orange-600 transition-colors">
          <Edit2 size={15} />
        </button>
        <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
