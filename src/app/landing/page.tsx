import Link from 'next/link'
import { PLAN_FEATURES, PLAN_PRICES } from '@/shared/lib/plans'

export default function LandingPage() {
  const plans = ['starter', 'pro', 'premium']

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-orange-500/30">MC</div>
            <span className="text-lg font-black text-slate-900">Mi Camarero</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/signup" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">Prueba gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">Sin comisiones — Tu restaurante, tu canal</div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 max-w-3xl mx-auto leading-tight">
          Tu restaurante merece su propio <span className="text-orange-500">canal digital</span>
        </h1>
        <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto">
          Carta digital con QR, pedidos en sala y online, cocina en tiempo real, upselling automatico y CRM. Todo sin pagar comisiones a terceros.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link href="/signup" className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/40">
            Empezar gratis 14 dias
          </Link>
          <Link href="#precios" className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-lg font-bold hover:border-slate-300 transition-colors">
            Ver precios
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">Sin tarjeta de credito — Activo en 10 minutos</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Todo lo que necesita tu restaurante</h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">Deja de pagar comisiones. Deja de depender de terceros. Ten el control total de tu negocio digital.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: 'Carta digital + QR', desc: 'Tus clientes escanean el QR y ven la carta en su movil. Sin apps, sin descargas.' },
              { icon: '📋', title: 'Pedidos en sala', desc: 'Los clientes piden desde su mesa. El pedido llega a la cocina al instante.' },
              { icon: '👨‍🍳', title: 'Cocina en tiempo real', desc: 'Pantalla KDS para cocina. Marcan platos como listos, el camarero lo sabe al instante.' },
              { icon: '🧠', title: 'Upselling automatico', desc: 'Sugerencias inteligentes que suben el ticket medio un 15%. "Acompana con una copa de vino?"' },
              { icon: '🛵', title: 'Delivery sin comisiones', desc: 'Tu propio canal de pedidos online. Sin el 30% de Glovo. El 100% es para ti.' },
              { icon: '👥', title: 'CRM + Fidelizacion', desc: 'Conoce a tus clientes, acumula puntos, crea recompensas. Que vuelvan una y otra vez.' },
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
          <h2 className="text-3xl font-black text-slate-900 mb-4">Por que los restaurantes cambian a Mi Camarero</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { metric: '0%', label: 'comisiones', desc: 'Todo lo que facturas es tuyo. Sin intermediarios.' },
              { metric: '+15%', label: 'ticket medio', desc: 'Con upselling automatico y combos inteligentes.' },
              { metric: '10 min', label: 'para estar activo', desc: 'Signup, crear carta, generar QR. Listo.' },
            ].map(s => (
              <div key={s.label} className="p-6">
                <p className="text-5xl font-black text-orange-500">{s.metric}</p>
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
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Precios simples, sin sorpresas</h2>
          <p className="text-center text-slate-500 mb-12">14 dias gratis en todos los planes. Sin tarjeta de credito.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const features = PLAN_FEATURES[plan] || []
              const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
              const isPopular = plan === 'pro'
              return (
                <div key={plan} className={`rounded-2xl border-2 bg-white p-6 relative ${isPopular ? 'border-orange-300 ring-2 ring-orange-400/50' : 'border-slate-200'}`}>
                  {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Mas popular</div>}
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{plan}</p>
                  <p className="mt-2"><span className="text-4xl font-black text-slate-900">{price.monthly}</span><span className="text-sm text-slate-500"> EUR/mes</span></p>
                  <div className="space-y-2 mt-6 mb-6">
                    {features.map(f => (
                      <div key={f.label} className="flex items-start gap-2 text-sm"><span>{f.icon}</span><span className="text-slate-700">{f.label}</span></div>
                    ))}
                  </div>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${isPopular ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    Empezar gratis
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
          <h2 className="text-3xl font-black text-slate-900 mb-4">Tu restaurante digital en 10 minutos</h2>
          <p className="text-slate-500 mb-8">Unete a los restaurantes que ya controlan su propio canal digital. Sin comisiones, sin dependencias.</p>
          <Link href="/signup" className="inline-block bg-orange-500 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/40">
            Crear mi restaurante gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white text-sm font-black">MC</div>
            <span className="text-sm font-bold text-white">Mi Camarero</span>
          </div>
          <p className="text-xs">2026 Mi Camarero. Plataforma SaaS para hosteleria.</p>
        </div>
      </footer>
    </div>
  )
}
