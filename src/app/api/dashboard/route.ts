import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { queryOne, query } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const tid = session.tenantId

  // Métricas de hoy
  const today = await queryOne(`
    SELECT
      COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as orders_today,
      COALESCE(SUM(total) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0) as revenue_today,
      COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND status IN ('pending','confirmed','preparing')) as active_orders
    FROM orders WHERE tenant_id = $1
  `, [tid])

  // Mesas ocupadas
  const tables = await queryOne(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'occupied') as occupied
    FROM tables WHERE tenant_id = $1 AND active = true
  `, [tid])

  // Items en carta
  const menuCount = await queryOne(
    'SELECT COUNT(*) as total FROM menu_items WHERE tenant_id = $1', [tid]
  )

  // Pedidos recientes
  const recentOrders = await query(`
    SELECT o.id, o.order_number, o.type, o.status, o.total, o.created_at,
           t.number as table_number, t.name as table_name
    FROM orders o
    LEFT JOIN tables t ON t.id = o.table_id
    WHERE o.tenant_id = $1
    ORDER BY o.created_at DESC
    LIMIT 5
  `, [tid])

  return NextResponse.json({
    stats: {
      ordersToday: Number(today?.orders_today || 0),
      revenueToday: Number(today?.revenue_today || 0),
      activeOrders: Number(today?.active_orders || 0),
      tablesOccupied: Number(tables?.occupied || 0),
      tablesTotal: Number(tables?.total || 0),
      menuItems: Number(menuCount?.total || 0),
    },
    recentOrders,
  })
}
