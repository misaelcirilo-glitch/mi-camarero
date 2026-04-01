'use client'

import { ClipboardList } from 'lucide-react'

export default function PedidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">Visualiza y gestiona todos los pedidos en tiempo real</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList size={32} className="text-blue-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Centro de Pedidos</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Recibe pedidos desde la carta digital, asignalos a mesas y haz seguimiento de su estado: pendiente, en preparacion, listo y entregado.</p>
      </div>
    </div>
  )
}
