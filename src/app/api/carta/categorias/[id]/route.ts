import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  position: z.number().optional(),
  active: z.boolean().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
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

  values.push(id, session.tenantId)
  const category = await queryOne(
    `UPDATE menu_categories SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
    values
  )

  if (!category) return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 404 })
  return NextResponse.json({ category })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  await query(
    'DELETE FROM menu_categories WHERE id = $1 AND tenant_id = $2',
    [id, session.tenantId]
  )

  return NextResponse.json({ ok: true })
}
