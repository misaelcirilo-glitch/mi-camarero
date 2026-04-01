import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const categories = await query(
    `SELECT c.*, COUNT(m.id) as item_count
     FROM menu_categories c
     LEFT JOIN menu_items m ON m.category_id = c.id AND m.tenant_id = c.tenant_id
     WHERE c.tenant_id = $1
     GROUP BY c.id
     ORDER BY c.position, c.name`,
    [session.tenantId]
  )

  return NextResponse.json({ categories })
}

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  icon: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { name, description, icon } = parsed.data

  // Obtener max position
  const maxPos = await queryOne(
    'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM menu_categories WHERE tenant_id = $1',
    [session.tenantId]
  )

  const category = await queryOne(
    `INSERT INTO menu_categories (tenant_id, name, description, icon, position)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [session.tenantId, name, description || null, icon || null, maxPos?.next_pos || 0]
  )

  return NextResponse.json({ category }, { status: 201 })
}
