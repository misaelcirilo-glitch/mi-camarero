'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/shared/components/sidebar'
import { useI18n } from '@/shared/lib/i18n'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

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
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
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
      <main className="ml-60 min-h-screen">
        {/* Trial banner */}
        {session.tenant.subscriptionStatus === 'trial' && (
          <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-orange-800 text-sm">{t.main.trialBanner}</p>
                <p className="text-xs text-orange-600">
                  {t.main.trialEnds} {new Date(session.tenant.trialEndsAt).toLocaleDateString(dateLocales[locale], { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <Link href="/planes" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm">
              {t.main.seePlans}
            </Link>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
