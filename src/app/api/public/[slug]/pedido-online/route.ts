import { NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/shared/lib/db'

const schema = z.object({
  type: z.enum(['takeaway', 'delivery']),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    extras: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
    notes: z.string().optional(),
  })).min(1),
  customer_name: z.string().min(2, 'Nombre requerido'),
  customer_phone: z.string().min(6, 'Telefono requerido'),
  customer_address: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const tenant = await queryOne(
    `SELECT t.id, t.tax_rate, p.has_online_ordering
     FROM tenants t
     JOIN plans p ON p.id = t.plan_id
     WHERE t.slug = $1 AND t.active = true`,
    [slug]
  )
  if (!tenant) return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  if (!tenant.has_online_ordering) {
    return NextResponse.json({ error: 'Este restaurante no tiene pedidos online activados' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { type, items, customer_name, customer_phone, customer_address, notes } = parsed.data

  if (type === 'delivery' && !customer_address) {
    return NextResponse.json({ error: 'Direccion requerida para delivery' }, { status: 400 })
  }

  const subtotal = items.reduce((acc, item) => {
    const extrasTotal = (item.extras || []).reduce((a, e) => a + e.price, 0)
    return acc + (item.unit_price + extrasTotal) * item.quantity
  }, 0)

  const taxRate = Number(tenant.tax_rate || 10)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const order = await queryOne(
    `INSERT INTO orders (tenant_id, type, status, subtotal, tax_amount, total, notes, customer_name, customer_phone, customer_address)
     VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9) RETURNING id, order_number`,
    [tenant.id, type, subtotal, taxAmount, total, notes || null, customer_name, customer_phone, customer_address || null]
  )

  for (const item of items) {
    await query(
      `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, extras, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [order!.id, item.menu_item_id, item.name, item.quantity, item.unit_price, JSON.stringify(item.extras || []), item.notes || null]
    )
  }

  return NextResponse.json({ order_id: order!.id, order_number: order!.order_number, total }, { status: 201 })
}
