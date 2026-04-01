import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo super admins (owners del primer tenant registrado o email especifico)
  const user = await queryOne('SELECT role FROM users WHERE id = $1', [session.userId])
  if (user?.role !== 'owner') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  // MRR
  const mrr = await queryOne(`
    SELECT
      COUNT(*) FILTER (WHERE subscription_status = 'active') as active_subs,
      COUNT(*) FILTER (WHERE subscription_status = 'trial') as trials,
      COUNT(*) FILTER (WHERE subscription_status = 'canceled') as canceled,
      COUNT(*) as total_tenants
    FROM tenants
  `)

  const mrrCalc = await queryOne(`
    SELECT COALESCE(SUM(p.price_monthly), 0) as mrr
    FROM tenants t
    JOIN plans p ON p.id = t.plan_id
    WHERE t.subscription_status = 'active'
  `)

  // Tenants list
  const tenants = await query(`
    SELECT t.id, t.name, t.slug, t.email, t.subscription_status, t.created_at, t.trial_ends_at,
           p.display_name as plan_name, p.price_monthly,
           COUNT(DISTINCT u.id) as staff_count,
           COUNT(DISTINCT m.id) as menu_items,
           COUNT(DISTINCT o.id) as orders_total,
           COALESCE(SUM(o.total), 0) as revenue_total
    FROM tenants t
    LEFT JOIN plans p ON p.id = t.plan_id
    LEFT JOIN users u ON u.tenant_id = t.id
    LEFT JOIN menu_items m ON m.tenant_id = t.id
    LEFT JOIN orders o ON o.tenant_id = t.id
    GROUP BY t.id, p.display_name, p.price_monthly
    ORDER BY t.created_at DESC
    LIMIT 50
  `)

  // Orders per day (last 30 days)
  const dailyOrders = await query(`
    SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY date
  `)

  return NextResponse.json({
    metrics: {
      mrr: Number(mrrCalc?.mrr || 0),
      activeSubs: Number(mrr?.active_subs || 0),
      trials: Number(mrr?.trials || 0),
      canceled: Number(mrr?.canceled || 0),
      totalTenants: Number(mrr?.total_tenants || 0),
      churnRate: Number(mrr?.total_tenants) > 0
        ? ((Number(mrr?.canceled || 0) / Number(mrr?.total_tenants)) * 100).toFixed(1)
        : '0.0',
    },
    tenants,
    dailyOrders,
  })
}
