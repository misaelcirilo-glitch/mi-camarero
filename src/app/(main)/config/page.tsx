'use client'

import { Settings } from 'lucide-react'

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Configuracion</h1>
        <p className="text-sm text-slate-500 mt-1">Ajustes generales de tu restaurante y cuenta</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings size={32} className="text-slate-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Ajustes del Restaurante</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Configura el nombre del local, horarios, impuestos, metodos de pago, integraciones con TPV y permisos del equipo de trabajo.</p>
      </div>
    </div>
  )
}
