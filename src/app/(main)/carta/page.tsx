'use client'

import { UtensilsCrossed } from 'lucide-react'

export default function CartaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Carta / Menu</h1>
        <p className="text-sm text-slate-500 mt-1">Gestiona las categorias, platos y precios de tu restaurante</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed size={32} className="text-orange-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Editor de Carta Digital</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Crea y organiza tu carta con categorias, platos, precios, alergenos y fotos. Tus clientes podran verla desde su movil escaneando un QR.</p>
      </div>
    </div>
  )
}
