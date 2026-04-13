'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList, Grid3X3,
  ChefHat, Users, Settings, LogOut, Crown, Sparkles
} from 'lucide-react'
import { useI18n } from '@/shared/lib/i18n'
import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher'

const NAV_KEYS = [
  { href: '/', key: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/carta', key: 'menu' as const, icon: UtensilsCrossed },
  { href: '/pedidos', key: 'orders' as const, icon: ClipboardList },
  { href: '/mesas', key: 'tables' as const, icon: Grid3X3 },
  { href: '/cocina', key: 'kitchen' as const, icon: ChefHat },
  { href: '/upselling', key: 'upselling' as const, icon: Sparkles },
  { href: '/clientes', key: 'customers' as const, icon: Users },
]

const NAV_BOTTOM = [
  { href: '/config', key: 'settings' as const, icon: Settings },
]

interface SidebarProps {
  user: { name: string; role: string }
  tenant: { name: string; slug: string }
  plan: { displayName: string }
}

export default function Sidebar({ user, tenant, plan }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-100 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-500/30">
            MC
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{tenant.name}</p>
            <div className="flex items-center gap-1">
              <Crown size={10} className="text-orange-500" />
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{plan.displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {NAV_KEYS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />}
              <item.icon size={18} className="shrink-0" />
              <span>{t.nav[item.key]}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: settings + locale + user */}
      <div className="border-t border-slate-100 px-3 py-3 space-y-2">
        {NAV_BOTTOM.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              <span>{t.nav[item.key]}</span>
            </Link>
          )
        })}

        <div className="px-1 py-1">
          <LocaleSwitcher variant="light" />
        </div>

        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-300 hover:text-red-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
