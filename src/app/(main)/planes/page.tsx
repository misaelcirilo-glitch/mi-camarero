'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Crown, Check, Loader2, ExternalLink, Sparkles } from 'lucide-react'
import { PLAN_FEATURES, PLAN_PRICES } from '@/shared/lib/plans'
import { Suspense } from 'react'
import { useI18n } from '@/shared/lib/i18n'

function PlanesContent() {
  const { t, formatPrice } = useI18n()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  const [currentPlan, setCurrentPlan] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState('')
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setCurrentPlan(data.plan?.name || 'starter')
      setSubscriptionStatus(data.tenant?.subscriptionStatus || 'trial')
    })
  }, [])

  const handleSubscribe = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Error')
    } finally { setLoading(null) }
  }

  const handlePortal = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const plans = ['starter', 'pro', 'premium']
  const PLAN_COLORS: Record<string, { border: string; bg: string; btn: string; badge: string }> = {
    starter: { border: 'border-slate-200', bg: 'bg-white', btn: 'bg-orange-500 hover:bg-orange-600', badge: 'bg-slate-50 text-slate-700 border border-slate-200' },
    pro: { border: 'border-orange-200', bg: 'bg-gradient-to-b from-orange-50 to-white', btn: 'bg-orange-500 hover:bg-orange-600 shadow-sm', badge: 'bg-orange-50 text-orange-700 border border-orange-200' },
    premium: { border: 'border-purple-200', bg: 'bg-gradient-to-b from-purple-50 to-white', btn: 'bg-orange-500 hover:bg-orange-600 shadow-sm', badge: 'bg-purple-50 text-purple-700 border border-purple-200' },
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <span className="w-10 h-10 bg-orange-50 ring-1 ring-orange-100 rounded-xl flex items-center justify-center">
            <Crown className="text-orange-500" size={20} />
          </span>
          {t.planes.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t.planes.subtitle}</p>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-4 text-center text-sm font-bold">Suscripcion activada! Tu plan ha sido actualizado.</div>}
      {canceled && <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4 text-center text-sm font-medium">Pago cancelado. Puedes intentarlo cuando quieras.</div>}

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-100 rounded-lg p-1 flex">
          <button onClick={() => setBilling('monthly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Mensual</button>
          <button onClick={() => setBilling('yearly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
            Anual <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">-17%</span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map(plan => {
          const colors = PLAN_COLORS[plan]
          const features = PLAN_FEATURES[plan] || []
          const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
          const isCurrent = currentPlan === plan
          const isPopular = plan === 'pro'

          return (
            <div key={plan} className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 relative shadow-sm ${isPopular ? 'ring-1 ring-orange-200' : ''}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <Sparkles size={12} /> {t.landing.mostPopular}
                </div>
              )}

              <div className="text-center mb-6">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${colors.badge} uppercase tracking-wider`}>{plan}</span>
                <div className="mt-3">
                  <span className="text-4xl font-bold tabular-nums text-slate-900">{billing === 'yearly' ? (price.yearly / 12).toFixed(0) : price.monthly}</span>
                  <span className="text-sm text-slate-500"> EUR{t.planes.perMonth}</span>
                </div>
                {billing === 'yearly' && <p className="text-xs text-emerald-600 font-bold mt-1">{price.yearly} EUR/ano (ahorras {price.monthly * 12 - price.yearly} EUR)</p>}
              </div>

              <div className="space-y-3 mb-6">
                {features.map(f => (
                  <div key={f.label} className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{f.icon}</span>
                    <div><p className="text-sm font-semibold text-slate-700">{f.label}</p><p className="text-[10px] text-slate-400">{f.description}</p></div>
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <button onClick={handlePortal} className="w-full py-3 rounded-lg font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                  {subscriptionStatus === 'active' ? <><ExternalLink size={14} /> {t.planes.manageSub}</> : t.planes.currentPlan}
                </button>
              ) : (
                <button onClick={() => handleSubscribe(plan)} disabled={loading === plan}
                  className={`w-full py-3 rounded-lg font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 ${colors.btn} disabled:opacity-50`}>
                  {loading === plan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {loading === plan ? t.common.loading : `${t.planes.selectPlan} ${plan}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-slate-400">Todos los planes incluyen 14 dias de prueba gratis. Cancela cuando quieras.</p>
    </div>
  )
}

export default function PlanesPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={22} className="animate-spin text-slate-400" /></div>}><PlanesContent /></Suspense>
}
