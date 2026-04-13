'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/shared/components/sidebar'
import { useI18n } from '@/shared/lib/i18n'

interface SessionData {
  user: { id: string; name: string; email: string; role: string }
  tenant: { id: string; name: string; slug: string; subscriptionStatus: string; trialEndsAt: string }
  plan: { name: string; displayName: string; limits: Record<string, number>; features: Record<string, boolean> }
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('No auth')
        return res.json()
      })
      .then(setSession)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{t.main.loading}</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  const dateLocales: Record<string, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={session.user} tenant={session.tenant} plan={session.plan} />
      <main className="ml-64 p-6 transition-all">
        {session.tenant.subscriptionStatus === 'trial' && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{t.main.trialBanner}</p>
              <p className="text-xs text-orange-100">
                {t.main.trialEnds} {new Date(session.tenant.trialEndsAt).toLocaleDateString(dateLocales[locale], { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors shadow-sm">
              {t.main.seePlans}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
