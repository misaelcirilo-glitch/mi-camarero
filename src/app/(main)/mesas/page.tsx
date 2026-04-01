'use client'

import { Grid3X3 } from 'lucide-react'

export default function MesasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Mesas</h1>
        <p className="text-sm text-slate-500 mt-1">Mapa interactivo del salon con estado de cada mesa</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Grid3X3 size={32} className="text-purple-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Gestion de Mesas</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Configura las mesas de tu local, visualiza cuales estan libres u ocupadas, y genera codigos QR unicos para que los clientes pidan desde su mesa.</p>
      </div>
    </div>
  )
}
