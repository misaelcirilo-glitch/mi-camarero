import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  let sql = `
    SELECT o.*,
           t.number as table_number, t.name as table_name,
           COALESCE(json_agg(
             json_build_object(
               'id', oi.id, 'name', oi.name, 'quantity', oi.quantity,
               'unit_price', oi.unit_price, 'extras', oi.extras,
               'notes', oi.notes, 'status', oi.status
             ) ORDER BY oi.created_at
           ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
    FROM orders o
    LEFT JOIN tables t ON t.id = o.table_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.tenant_id = $1
  `
  const params: unknown[] = [session.tenantId]
  let idx = 2

  if (status) {
    if (status === 'active') {
      sql += ` AND o.status NOT IN ('paid', 'cancelled')`
    } else {
      sql += ` AND o.status = $${idx}`
      params.push(status)
      idx++
    }
  }

  if (type) {
    sql += ` AND o.type = $${idx}`
    params.push(type)
    idx++
  }

  sql += ` GROUP BY o.id, t.number, t.name ORDER BY o.created_at DESC LIMIT 50`

  const orders = await query(sql, params)
  return NextResponse.json({ orders })
}

const createSchema = z.object({
  table_id: z.string().uuid().optional(),
  type: z.enum(['dine_in', 'takeaway', 'delivery']),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    extras: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
    notes: z.string().optional(),
  })).min(1, 'El pedido debe tener al menos 1 item'),
  notes: z.string().optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { table_id, type, items, notes, customer_name, customer_phone } = parsed.data

  const subtotal = items.reduce((acc, item) => {
    const extrasTotal = (item.extras || []).reduce((a, e) => a + e.price, 0)
    return acc + (item.unit_price + extrasTotal) * item.quantity
  }, 0)

  const tenant = await queryOne('SELECT tax_rate FROM tenants WHERE id = $1', [session.tenantId])
  const taxRate = Number(tenant?.tax_rate || 10)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const order = await queryOne(
    `INSERT INTO orders (tenant_id, table_id, type, status, subtotal, tax_amount, total, notes, customer_name, customer_phone, created_by)
     VALUES ($1, $2, $3, 'confirmed', $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [session.tenantId, table_id || null, type, subtotal, taxAmount, total, notes || null, customer_name || null, customer_phone || null, session.userId]
  )

  for (const item of items) {
    await query(
      `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, extras, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [order!.id, item.menu_item_id, item.name, item.quantity, item.unit_price, JSON.stringify(item.extras || []), item.notes || null]
    )
  }

  // Marcar mesa como ocupada
  if (table_id) {
    await query(`UPDATE tables SET status = 'occupied' WHERE id = $1`, [table_id])
  }

  return NextResponse.json({ order }, { status: 201 })
}
