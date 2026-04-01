import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

const schema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  image_url: z.string().optional().nullable(),
  allergens: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  calories: z.number().optional().nullable(),
  prep_time_min: z.number().optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  position: z.number().optional(),
  extras: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    price: z.number().min(0),
  })).optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { extras, ...itemData } = parsed.data

  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const [key, val] of Object.entries(itemData)) {
    if (val !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(val)
      idx++
    }
  }

  if (fields.length > 0) {
    fields.push(`updated_at = NOW()`)
    values.push(id, session.tenantId)
    await queryOne(
      `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
      values
    )
  }

  // Actualizar extras: borrar y recrear
  if (extras !== undefined) {
    await query('DELETE FROM menu_item_extras WHERE item_id = $1', [id])
    for (let i = 0; i < extras.length; i++) {
      await query(
        'INSERT INTO menu_item_extras (item_id, name, price, position) VALUES ($1, $2, $3, $4)',
        [id, extras[i].name, extras[i].price, i]
      )
    }
  }

  // Devolver item actualizado con extras
  const item = await queryOne(`
    SELECT m.*, c.name as category_name,
           COALESCE(json_agg(
             json_build_object('id', e.id, 'name', e.name, 'price', e.price, 'active', e.active)
           ) FILTER (WHERE e.id IS NOT NULL), '[]') as extras
    FROM menu_items m
    LEFT JOIN menu_categories c ON c.id = m.category_id
    LEFT JOIN menu_item_extras e ON e.item_id = m.id
    WHERE m.id = $1 AND m.tenant_id = $2
    GROUP BY m.id, c.name
  `, [id, session.tenantId])

  if (!item) return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  await query('DELETE FROM menu_items WHERE id = $1 AND tenant_id = $2', [id, session.tenantId])
  return NextResponse.json({ ok: true })
}
