'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/shared/lib/i18n'
import { Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useI18n()
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
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {step > 1 ? <Check size={14} /> : '1'}
        </div>
        <div className={`flex-1 h-0.5 rounded ${step > 1 ? 'bg-orange-500' : 'bg-slate-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-1">{t.auth.createAccount}</h2>
      <p className="text-sm text-slate-500 mb-6">{t.auth.signupSubtitle}</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.auth.yourName}</label>
              <input
                type="text" required value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder={t.auth.namePlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.auth.email}</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder={t.auth.emailPlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.auth.password}</label>
              <input
                type="password" required minLength={6} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder={t.auth.minChars}
              />
            </div>
            <button
              type="button"
              onClick={() => { if (form.name && form.email && form.password.length >= 6) setStep(2) }}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              {t.auth.next}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.auth.restaurantName}</label>
              <input
                type="text" required value={form.restaurantName}
                onChange={e => setForm(p => ({ ...p, restaurantName: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder={t.auth.restaurantPlaceholder}
                autoFocus
              />
              {form.restaurantName && (
                <p className="text-xs text-slate-400 mt-1.5">
                  {t.auth.menuAt} <span className="font-semibold text-orange-500">
                    {form.restaurantName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                  </span>
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-700 mb-2">{t.auth.starterIncludes}</p>
              <ul className="text-xs text-orange-600 space-y-1.5">
                {t.auth.starterFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={12} className="text-orange-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button" onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t.auth.back}
              </button>
              <button
                type="submit" disabled={loading || !form.restaurantName}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? t.auth.creating : t.auth.createRestaurant}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {t.auth.haveAccount}{' '}
        <Link href="/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
          {t.auth.loginLink}
        </Link>
      </p>
    </div>
  )
}
