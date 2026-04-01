'use client'

import { Users } from 'lucide-react'

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Clientes</h1>
        <p className="text-sm text-slate-500 mt-1">Base de datos de clientes y programa de fidelizacion</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">CRM de Clientes</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Conoce a tus clientes frecuentes, sus platos favoritos e historial de pedidos. Lanza promociones personalizadas y programas de puntos para fidelizarlos.</p>
      </div>
    </div>
  )
}
