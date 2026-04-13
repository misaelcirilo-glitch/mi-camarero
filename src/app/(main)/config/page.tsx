'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Loader2, ExternalLink, Crown } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/shared/lib/i18n'

export default function ConfigPage() {
  const { t, locale } = useI18n()
  const [tenant, setTenant] = useState<Record<string, any> | null>(null)
  const [plan, setPlan] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setTenant(data.tenant); setPlan(data.plan); setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-slate-400"><Loader2 size={22} className="animate-spin" /><span className="text-sm">{t.common.loading}</span></div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Settings className="text-slate-500" size={24} /> {t.config.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.config.subtitle}</p>
      </div>

      {/* Plan info */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-orange-500" />
              <span className="font-bold text-slate-800">{t.config.plan} {plan?.displayName || 'Starter'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tenant?.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : tenant?.subscriptionStatus === 'trial' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                {tenant?.subscriptionStatus === 'active' ? 'Activo' : tenant?.subscriptionStatus === 'trial' ? 'Trial' : tenant?.subscriptionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {plan?.limits?.maxMenuItems} platos — {plan?.limits?.maxTables} mesas — {plan?.limits?.maxStaff} staff
            </p>
            {tenant?.subscriptionStatus === 'trial' && tenant?.trialEndsAt && (
              <p className="text-xs text-orange-600 font-bold mt-1">
                Trial termina el {new Date(tenant.trialEndsAt).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
          <Link href="/planes" className="flex items-center gap-1.5 bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold border border-orange-200 hover:bg-orange-50 transition-colors">
            <ExternalLink size={14} /> {t.config.upgrade}
          </Link>
        </div>
      </div>

      {/* Restaurant info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-800">{t.config.restaurantData}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.config.name}</label>
            <p className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">{tenant?.name}</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.config.publicUrl}</label>
            <p className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">mi-camarero.com/r/<span className="text-orange-600 font-bold">{tenant?.slug}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.config.subscriptionStatus}</label>
            <p className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 capitalize">{tenant?.subscriptionStatus}</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IVA</label>
            <p className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">{tenant?.taxRate}%</p>
          </div>
        </div>
      </div>

      {/* Features del plan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-4">{t.config.planFeatures}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'onlineOrdering', label: 'Pedidos online' },
            { key: 'upselling', label: 'Upselling inteligente' },
            { key: 'crm', label: 'CRM clientes' },
            { key: 'loyalty', label: 'Fidelizacion' },
            { key: 'customBranding', label: 'Branding custom' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'whatsapp', label: 'WhatsApp' },
          ].map(f => (
            <div key={f.key} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${plan?.features?.[f.key] ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                {plan?.features?.[f.key] ? '✓' : '✗'}
              </div>
              <span className={`text-sm ${plan?.features?.[f.key] ? 'text-slate-700' : 'text-slate-400'}`}>{f.label}</span>
            </div>
          ))}
        </div>
        {!plan?.features?.onlineOrdering && (
          <Link href="/planes" className="inline-block mt-4 text-xs font-bold text-orange-500 hover:underline">{t.config.upgradeMsg}</Link>
        )}
      </div>
    </div>
  )
}
