import { NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/shared/lib/db'

const schema = z.object({
  mesa: z.number().min(1),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    extras: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
    notes: z.string().optional(),
  })).min(1),
  notes: z.string().optional(),
  customer_name: z.string().optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const tenant = await queryOne(
    'SELECT id, tax_rate FROM tenants WHERE slug = $1 AND active = true',
    [slug]
  )
  if (!tenant) return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { mesa, items, notes, customer_name } = parsed.data

  // Buscar mesa
  const table = await queryOne(
    'SELECT id FROM tables WHERE tenant_id = $1 AND number = $2 AND active = true',
    [tenant.id, mesa]
  )
  if (!table) return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })

  const subtotal = items.reduce((acc, item) => {
    const extrasTotal = (item.extras || []).reduce((a, e) => a + e.price, 0)
    return acc + (item.unit_price + extrasTotal) * item.quantity
  }, 0)

  const taxRate = Number(tenant.tax_rate || 10)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const order = await queryOne(
    `INSERT INTO orders (tenant_id, table_id, type, status, subtotal, tax_amount, total, notes, customer_name)
     VALUES ($1, $2, 'dine_in', 'pending', $3, $4, $5, $6, $7) RETURNING id, order_number`,
    [tenant.id, table.id, subtotal, taxAmount, total, notes || null, customer_name || null]
  )

  for (const item of items) {
    await query(
      `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, extras, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [order!.id, item.menu_item_id, item.name, item.quantity, item.unit_price, JSON.stringify(item.extras || []), item.notes || null]
    )
  }

  // Marcar mesa como ocupada
  await query(`UPDATE tables SET status = 'occupied' WHERE id = $1`, [table.id])

  return NextResponse.json({
    order_id: order!.id,
    order_number: order!.order_number,
    total,
  }, { status: 201 })
}
