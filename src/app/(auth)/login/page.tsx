'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/shared/lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">{t.auth.welcomeBack}</h2>
      <p className="text-sm text-slate-500 mb-6">{t.auth.loginSubtitle}</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.auth.email}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.auth.password}</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder={t.auth.passwordPlaceholder}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? t.auth.loggingIn : t.auth.login}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {t.auth.noAccount}{' '}
        <Link href="/signup" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
          {t.auth.tryFree}
        </Link>
      </p>
    </div>
  )
}
