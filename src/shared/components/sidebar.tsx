'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList, Grid3X3,
  ChefHat, Users, Settings, LogOut, Crown, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/carta', label: 'Carta', icon: UtensilsCrossed },
  { href: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/mesas', label: 'Mesas', icon: Grid3X3 },
  { href: '/cocina', label: 'Cocina', icon: ChefHat },
  { href: '/upselling', label: 'Upselling', icon: Sparkles },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/config', label: 'Ajustes', icon: Settings },
]

interface SidebarProps {
  user: { name: string; role: string }
  tenant: { name: string; slug: string }
  plan: { displayName: string }
}

export default function Sidebar({ user, tenant, plan }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-orange-500/30">
            MC
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{tenant.name}</p>
              <div className="flex items-center gap-1">
                <Crown size={10} className="text-orange-400" />
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">{plan.displayName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Collapse */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
