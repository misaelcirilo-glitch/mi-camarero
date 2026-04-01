'use client'

import { ChefHat } from 'lucide-react'

export default function CocinaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Cocina</h1>
        <p className="text-sm text-slate-500 mt-1">Pantalla de cocina para gestionar la preparacion de platos</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ChefHat size={32} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Display de Cocina (KDS)</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Vista optimizada para pantalla de cocina. Los pedidos llegan en tiempo real, el cocinero marca cada plato como preparado y el camarero recibe la notificacion al instante.</p>
      </div>
    </div>
  )
}
