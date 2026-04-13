'use client'

import Link from 'next/link'
import { PLAN_FEATURES, PLAN_PRICES } from '@/shared/lib/plans'
import { useI18n } from '@/shared/lib/i18n'
import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher'

export default function LandingPage() {
  const { t } = useI18n()
  const plans = ['starter', 'pro', 'premium']

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm shadow-orange-500/20">MC</div>
            <span className="text-lg font-bold text-slate-900">Mi Camarero</span>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher variant="light" />
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">{t.landing.enter}</Link>
            <Link href="/signup" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20">{t.landing.tryFree}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">{t.landing.tagline}</div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
          {t.landing.heroTitle} <span className="text-orange-500">{t.landing.heroHighlight}</span>
        </h1>
        <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto">{t.landing.heroDesc}</p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link href="/signup" className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
            {t.landing.startFree}
          </Link>
          <Link href="#precios" className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-lg font-bold hover:border-slate-300 transition-colors">
            {t.landing.seePricing}
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">{t.landing.noCreditCard}</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{t.landing.featuresTitle}</h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">{t.landing.featuresDesc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: t.landing.features.qrMenu, desc: t.landing.features.qrMenuDesc },
              { icon: '📋', title: t.landing.features.dineIn, desc: t.landing.features.dineInDesc },
              { icon: '👨‍🍳', title: t.landing.features.kitchen, desc: t.landing.features.kitchenDesc },
              { icon: '🧠', title: t.landing.features.upselling, desc: t.landing.features.upsellingDesc },
              { icon: '🛵', title: t.landing.features.delivery, desc: t.landing.features.deliveryDesc },
              { icon: '👥', title: t.landing.features.crm, desc: t.landing.features.crmDesc },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-slate-800 mt-3 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.landing.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { metric: '0%', label: t.landing.socialProof.noCommissions, desc: t.landing.socialProof.noCommissionsDesc },
              { metric: '+15%', label: t.landing.socialProof.avgTicket, desc: t.landing.socialProof.avgTicketDesc },
              { metric: '10 min', label: t.landing.socialProof.setupTime, desc: t.landing.socialProof.setupTimeDesc },
            ].map(s => (
              <div key={s.label} className="p-6">
                <p className="text-5xl font-bold text-orange-500">{s.metric}</p>
                <p className="text-sm font-bold text-slate-700 mt-2 uppercase tracking-wide">{s.label}</p>
                <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{t.landing.pricingTitle}</h2>
          <p className="text-center text-slate-500 mb-12">{t.landing.pricingDesc}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const features = PLAN_FEATURES[plan] || []
              const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
              const isPopular = plan === 'pro'
              return (
                <div key={plan} className={`rounded-2xl border-2 bg-white p-6 relative ${isPopular ? 'border-orange-300 ring-2 ring-orange-400/50' : 'border-slate-200'}`}>
                  {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t.landing.mostPopular}</div>}
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{plan}</p>
                  <p className="mt-2"><span className="text-4xl font-bold text-slate-900">{price.monthly}</span><span className="text-sm text-slate-500"> EUR{t.landing.perMonth}</span></p>
                  <div className="space-y-2 mt-6 mb-6">
                    {features.map(f => (
                      <div key={f.label} className="flex items-start gap-2 text-sm"><span>{f.icon}</span><span className="text-slate-700">{f.label}</span></div>
                    ))}
                  </div>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${isPopular ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {t.landing.startFreePlan}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.landing.ctaTitle}</h2>
          <p className="text-slate-500 mb-8">{t.landing.ctaDesc}</p>
          <Link href="/signup" className="inline-block bg-orange-500 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
            {t.landing.ctaButton}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">MC</div>
            <span className="text-sm font-bold text-white">Mi Camarero</span>
          </div>
          <p className="text-xs">2026 Mi Camarero. {t.landing.footerText}</p>
        </div>
      </footer>
    </div>
  )
}
