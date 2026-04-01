import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await queryOne(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.phone,
            t.id as tenant_id, t.name as tenant_name, t.slug as tenant_slug,
            t.subscription_status, t.trial_ends_at, t.logo_url as tenant_logo,
            t.currency, t.tax_rate,
            p.name as plan_name, p.display_name as plan_display_name,
            p.max_menu_items, p.max_tables, p.max_staff, p.max_orders_month,
            p.has_online_ordering, p.has_upselling, p.has_crm, p.has_loyalty,
            p.has_custom_branding, p.has_analytics, p.has_whatsapp
     FROM users u
     JOIN tenants t ON t.id = u.tenant_id
     LEFT JOIN plans p ON p.id = t.plan_id
     WHERE u.id = $1`,
    [session.userId]
  )

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      phone: user.phone,
    },
    tenant: {
      id: user.tenant_id,
      name: user.tenant_name,
      slug: user.tenant_slug,
      subscriptionStatus: user.subscription_status,
      trialEndsAt: user.trial_ends_at,
      logoUrl: user.tenant_logo,
      currency: user.currency,
      taxRate: user.tax_rate,
    },
    plan: {
      name: user.plan_name,
      displayName: user.plan_display_name,
      limits: {
        maxMenuItems: user.max_menu_items,
        maxTables: user.max_tables,
        maxStaff: user.max_staff,
        maxOrdersMonth: user.max_orders_month,
      },
      features: {
        onlineOrdering: user.has_online_ordering,
        upselling: user.has_upselling,
        crm: user.has_crm,
        loyalty: user.has_loyalty,
        customBranding: user.has_custom_branding,
        analytics: user.has_analytics,
        whatsapp: user.has_whatsapp,
      },
    },
  })
}
