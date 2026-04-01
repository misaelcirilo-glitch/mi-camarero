'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurantName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/onboarding')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Crea tu cuenta</h2>
      <p className="text-sm text-slate-500 mb-6">14 dias gratis. Sin tarjeta de credito.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tu nombre</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Juan Garcia"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="juan@mirestaurante.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Minimo 6 caracteres"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (form.name && form.email && form.password.length >= 6) setStep(2)
              }}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Siguiente
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Nombre de tu restaurante</label>
              <input
                type="text"
                required
                value={form.restaurantName}
                onChange={e => setForm(p => ({ ...p, restaurantName: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Bar El Buen Sabor"
                autoFocus
              />
              {form.restaurantName && (
                <p className="text-xs text-slate-400 mt-1">
                  Tu carta estara en: mi-camarero.com/<span className="font-bold text-orange-500">
                    {form.restaurantName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                  </span>
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-700 mb-2">Plan Starter incluido gratis 14 dias:</p>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>Carta digital con QR (hasta 30 platos)</li>
                <li>Gestion de 8 mesas</li>
                <li>Sistema de pedidos en sala</li>
                <li>Panel de cocina en tiempo real</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Atras
              </button>
              <button
                type="submit"
                disabled={loading || !form.restaurantName}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/30"
              >
                {loading ? 'Creando...' : 'Crear restaurante'}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="text-orange-600 font-bold hover:underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  )
}
