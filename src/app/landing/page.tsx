'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PLAN_FEATURES, PLAN_PRICES } from '@/shared/lib/plans'
import { useI18n } from '@/shared/lib/i18n'
import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher'
import {
  ArrowRight, Check, Sparkles, ChevronDown, Quote, Star, Shield,
  ShoppingBag, ChefHat, Smartphone, TrendingUp, Users, Zap
} from 'lucide-react'

export default function LandingPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const plans = ['starter', 'pro', 'premium']

  const handleDemo = async () => {
    setDemoLoading(true)
    try {
      const res = await fetch('/api/demo-login', { method: 'POST' })
      if (res.ok) {
        // Hard navigate para que el server vea la cookie nueva
        window.location.href = '/carta'
      } else {
        setDemoLoading(false)
      }
    } catch {
      setDemoLoading(false)
    }
  }

  const faqs = [
    { q: t.landing.faq1Q, a: t.landing.faq1A },
    { q: t.landing.faq2Q, a: t.landing.faq2A },
    { q: t.landing.faq3Q, a: t.landing.faq3A },
    { q: t.landing.faq4Q, a: t.landing.faq4A },
    { q: t.landing.faq5Q, a: t.landing.faq5A },
  ]

  const testimonials = [
    { name: t.landing.testimonial1Name, role: t.landing.testimonial1Role, text: t.landing.testimonial1Text, color: 'from-orange-500 to-red-500' },
    { name: t.landing.testimonial2Name, role: t.landing.testimonial2Role, text: t.landing.testimonial2Text, color: 'from-blue-500 to-cyan-500' },
    { name: t.landing.testimonial3Name, role: t.landing.testimonial3Role, text: t.landing.testimonial3Text, color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm shadow-orange-500/30">MC</div>
            <span className="text-lg font-black text-slate-900">Mi Camarero</span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher variant="light" />
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 rounded-lg transition-colors"
            >
              <Sparkles size={14} className="text-orange-500" />
              {demoLoading ? t.landing.demoLoading : t.landing.seeDemo}
            </button>
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">{t.landing.enter}</Link>
            <Link href="/signup" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20">
              {t.landing.tryFree}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <Sparkles size={12} />
                {t.landing.heroBadge}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                {t.landing.heroTitle}{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {t.landing.heroHighlight}
                </span>
              </h1>
              <p className="text-lg text-slate-500 mt-6 max-w-xl leading-relaxed">{t.landing.heroDesc}</p>
              <div className="flex flex-wrap items-center gap-3 mt-10">
                <Link href="/signup" className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2">
                  {t.landing.startFree} <ArrowRight size={18} />
                </Link>
                <button
                  onClick={handleDemo}
                  disabled={demoLoading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-base font-bold transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-orange-500" />
                  {demoLoading ? t.landing.demoLoading : t.landing.seeDemo}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                <Check size={12} className="text-emerald-500" /> {t.landing.noCreditCard}
              </p>
            </div>

            {/* Right: Phone mockup with menu */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-200 rounded-2xl rotate-12 blur-xl opacity-70" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-200 rounded-2xl -rotate-12 blur-xl opacity-70" />

              <div className="relative mx-auto max-w-sm">
                <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-orange-500/10">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Mock header */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-black text-sm">
                          BD
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">Bar Demo</p>
                          <p className="text-white/70 text-[10px]">Madrid · Mesa 4</p>
                        </div>
                      </div>
                    </div>

                    {/* Mock category pills */}
                    <div className="px-4 pt-3 flex gap-2 overflow-x-auto">
                      <span className="text-[10px] font-bold bg-orange-500 text-white px-2.5 py-1 rounded-full whitespace-nowrap">🍤 Tapas</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full whitespace-nowrap">🍽️ Raciones</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full whitespace-nowrap">🍺 Bebidas</span>
                    </div>

                    {/* Mock menu items */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="bg-slate-50 border border-orange-200 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-slate-800 text-xs font-bold">Patatas bravas</p>
                              <Star size={10} className="text-amber-400 fill-amber-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">Salsa brava casera y alioli</p>
                          </div>
                          <p className="font-black text-orange-600 text-sm tabular-nums">5,50€</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-slate-800 text-xs font-bold">Croquetas de jamón</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">6 unidades caseras</p>
                          </div>
                          <p className="font-black text-orange-600 text-sm tabular-nums">6,00€</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-slate-800 text-xs font-bold">Pulpo a la gallega</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Pimentón y aceite de oliva</p>
                          </div>
                          <p className="font-black text-orange-600 text-sm tabular-nums">9,50€</p>
                        </div>
                      </div>
                    </div>

                    {/* Mock cart bar */}
                    <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <ShoppingBag size={14} />
                        <span className="text-xs font-bold">3 items</span>
                      </div>
                      <span className="text-white text-xs font-black">21,00€ →</span>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -left-6 bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/30 -rotate-6">
                  <p className="text-[10px] font-black flex items-center gap-1">
                    <Check size={11} /> Pedido enviado
                  </p>
                </div>
                <div className="absolute -bottom-2 -right-6 bg-white border-2 border-orange-200 px-3 py-2 rounded-xl shadow-lg rotate-6">
                  <p className="text-[10px] font-black text-orange-600 flex items-center gap-1">
                    <ChefHat size={12} /> En cocina
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social proof */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-10">{t.landing.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-black text-orange-500">0%</p>
              <p className="text-sm font-bold text-slate-700 mt-3 uppercase tracking-wide">{t.landing.socialProof.noCommissions}</p>
              <p className="text-sm text-slate-500 mt-1">{t.landing.socialProof.noCommissionsDesc}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-black text-orange-500">+15%</p>
              <p className="text-sm font-bold text-slate-700 mt-3 uppercase tracking-wide">{t.landing.socialProof.avgTicket}</p>
              <p className="text-sm text-slate-500 mt-1">{t.landing.socialProof.avgTicketDesc}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-black text-orange-500">10 min</p>
              <p className="text-sm font-bold text-slate-700 mt-3 uppercase tracking-wide">{t.landing.socialProof.setupTime}</p>
              <p className="text-sm text-slate-500 mt-1">{t.landing.socialProof.setupTimeDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t.landing.howTitle}</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">{t.landing.howSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: Smartphone, title: t.landing.step1Title, desc: t.landing.step1Desc },
              { n: '02', icon: Zap, title: t.landing.step2Title, desc: t.landing.step2Desc },
              { n: '03', icon: TrendingUp, title: t.landing.step3Title, desc: t.landing.step3Desc },
            ].map((step, i) => (
              <div key={i} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="text-7xl font-black text-orange-100 absolute top-2 right-4">{step.n}</div>
                <div className="w-12 h-12 bg-orange-50 ring-1 ring-orange-100 rounded-xl flex items-center justify-center mb-4 relative">
                  <step.icon size={22} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg relative">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-2 relative">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4">{t.landing.featuresTitle}</h2>
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
              <div key={f.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-slate-800 mt-3 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t.landing.testimonialsTitle}</h2>
            <p className="text-slate-500 mt-3">{t.landing.testimonialsSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tt, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 relative">
                <Quote size={28} className="text-orange-200 absolute top-4 right-4" />
                <div className="flex items-center gap-1 text-orange-400 mb-4">
                  {[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">{tt.text}</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div className={`w-10 h-10 bg-gradient-to-br ${tt.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                    {tt.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-slate-800 text-sm font-bold">{tt.name}</p>
                    <p className="text-xs text-slate-500">{tt.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4">{t.landing.pricingTitle}</h2>
          <p className="text-center text-slate-500 mb-12">{t.landing.pricingDesc}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const features = PLAN_FEATURES[plan] || []
              const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
              const isPopular = plan === 'pro'
              return (
                <div key={plan} className={`rounded-2xl border-2 bg-white p-6 relative ${isPopular ? 'border-orange-300 shadow-lg shadow-orange-500/10' : 'border-slate-200'}`}>
                  {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t.landing.mostPopular}</div>}
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{plan}</p>
                  <p className="mt-2"><span className="text-4xl font-bold text-slate-900">{price.monthly}</span><span className="text-sm text-slate-500"> EUR{t.landing.perMonth}</span></p>
                  <div className="space-y-2 mt-6 mb-6">
                    {features.map(f => (
                      <div key={f.label} className="flex items-start gap-2 text-sm">
                        <span>{f.icon}</span>
                        <span className="text-slate-700">{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${isPopular ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {t.landing.startFreePlan}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t.landing.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-800 font-bold">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && <p className="text-sm text-slate-500 mt-3 leading-relaxed">{faq.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-xl shadow-orange-500/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10"><ChefHat size={60} className="text-white" /></div>
              <div className="absolute bottom-10 right-10"><ShoppingBag size={80} className="text-white" /></div>
              <div className="absolute top-1/2 left-1/4"><Users size={40} className="text-white" /></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white relative">{t.landing.finalCtaTitle}</h2>
            <p className="text-white/90 mt-4 text-lg relative">{t.landing.finalCtaDesc}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 relative">
              <Link href="/signup" className="bg-white text-orange-600 px-8 py-4 rounded-2xl text-base font-bold hover:brightness-110 transition-all shadow-xl flex items-center gap-2">
                {t.landing.finalCtaButton} <ArrowRight size={18} />
              </Link>
              <button
                onClick={handleDemo}
                disabled={demoLoading}
                className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles size={16} />
                {demoLoading ? t.landing.demoLoading : t.landing.seeDemo}
              </button>
            </div>
            <p className="text-xs text-white/80 mt-5 relative flex items-center justify-center gap-2">
              <Shield size={12} /> {t.landing.finalCtaNote}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white text-sm font-black">MC</div>
            <span className="text-sm font-bold text-white">Mi Camarero</span>
          </div>
          <p className="text-xs">2026 Mi Camarero. {t.landing.footerText}</p>
        </div>
      </footer>
    </div>
  )
}
