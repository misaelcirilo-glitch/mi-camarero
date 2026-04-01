'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CUISINE_TYPES = [
  { id: 'tapas', label: 'Tapas / Bar', icon: '🍺' },
  { id: 'mediterraneo', label: 'Mediterraneo', icon: '🫒' },
  { id: 'italiano', label: 'Italiano', icon: '🍕' },
  { id: 'asiatico', label: 'Asiatico', icon: '🍜' },
  { id: 'mexicano', label: 'Mexicano', icon: '🌮' },
  { id: 'burger', label: 'Hamburguesas', icon: '🍔' },
  { id: 'cafeteria', label: 'Cafeteria', icon: '☕' },
  { id: 'otro', label: 'Otro', icon: '🍽️' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cuisine, setCuisine] = useState('')
  const [tableCount, setTableCount] = useState(5)
  const [tenantName, setTenantName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.tenant) setTenantName(data.tenant.name)
      })
  }, [])

  const handleFinish = () => {
    // Guardar preferencias como settings del tenant
    fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuisine, tableCount }),
    }).then(() => router.push('/'))
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-orange-500' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {tenantName ? `Configuremos ${tenantName}` : 'Configuremos tu restaurante'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">Que tipo de cocina ofreces?</p>

          <div className="grid grid-cols-2 gap-3">
            {CUISINE_TYPES.map(c => (
              <button
                key={c.id}
                onClick={() => { setCuisine(c.id); setStep(2) }}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  cuisine === c.id
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <span className="text-2xl block mb-1">{c.icon}</span>
                <span className="text-sm font-bold text-slate-700">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Cuantas mesas tienes?</h2>
          <p className="text-sm text-slate-500 mb-6">Puedes cambiarlo despues</p>

          <div className="flex items-center justify-center gap-6 py-8">
            <button
              onClick={() => setTableCount(Math.max(1, tableCount - 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-xl hover:bg-slate-200 transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-5xl font-black text-slate-900">{tableCount}</span>
              <p className="text-sm text-slate-500 mt-1">mesas</p>
            </div>
            <button
              onClick={() => setTableCount(Math.min(50, tableCount + 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-xl hover:bg-slate-200 transition-colors"
            >
              +
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Atras
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Todo listo!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Tu restaurante esta configurado. Ahora puedes crear tu carta, gestionar mesas y empezar a recibir pedidos.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Proximos pasos:</p>
            <div className="space-y-2">
              {[
                { icon: '📱', text: 'Crea tu carta digital' },
                { icon: '🪑', text: 'Configura tus mesas y genera QRs' },
                { icon: '📋', text: 'Recibe tu primer pedido' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Atras
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              Ir al dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
