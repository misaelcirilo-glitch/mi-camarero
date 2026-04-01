import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled']).optional(),
  payment_method: z.enum(['cash', 'card', 'online']).optional(),
  notes: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const [key, val] of Object.entries(parsed.data)) {
    if (val !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(val)
      idx++
    }
  }

  if (fields.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })

  fields.push(`updated_at = NOW()`)

  // Si se marca como pagado, actualizar payment_status
  if (parsed.data.status === 'paid') {
    fields.push(`payment_status = 'paid'`)
  }

  values.push(id, session.tenantId)
  const order = await queryOne(
    `UPDATE orders SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
    values
  )

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  // Si se paga o cancela, liberar mesa
  if (parsed.data.status === 'paid' || parsed.data.status === 'cancelled') {
    if (order.table_id) {
      const activeOrders = await query(
        `SELECT id FROM orders WHERE table_id = $1 AND status NOT IN ('paid', 'cancelled') AND id != $2`,
        [order.table_id, id]
      )
      if (activeOrders.length === 0) {
        await query(`UPDATE tables SET status = 'free' WHERE id = $1`, [order.table_id])
      }
    }
  }

  return NextResponse.json({ order })
}

// Actualizar estado de un item individual
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const { item_id, status } = await request.json()

  if (!item_id || !status) {
    return NextResponse.json({ error: 'item_id y status requeridos' }, { status: 400 })
  }

  // Verificar que el pedido pertenece al tenant
  const order = await queryOne(
    'SELECT id FROM orders WHERE id = $1 AND tenant_id = $2',
    [id, session.tenantId]
  )
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  await query(
    'UPDATE order_items SET status = $1 WHERE id = $2 AND order_id = $3',
    [status, item_id, id]
  )

  // Si todos los items estan listos, marcar pedido como ready
  const pendingItems = await query(
    `SELECT id FROM order_items WHERE order_id = $1 AND status NOT IN ('ready', 'served')`,
    [id]
  )
  if (pendingItems.length === 0) {
    await query(`UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = $1`, [id])
  }

  return NextResponse.json({ ok: true })
}
