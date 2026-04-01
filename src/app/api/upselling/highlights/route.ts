import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const highlights = await query(`
    SELECT h.*, m.name as item_name, m.price as item_price
    FROM time_highlights h
    JOIN menu_items m ON m.id = h.menu_item_id
    WHERE h.tenant_id = $1
    ORDER BY h.start_hour
  `, [session.tenantId])

  return NextResponse.json({ highlights })
}

const schema = z.object({
  menu_item_id: z.string().uuid(),
  day_of_week: z.array(z.number().min(0).max(6)),
  start_hour: z.string(),
  end_hour: z.string(),
  label: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { menu_item_id, day_of_week, start_hour, end_hour, label } = parsed.data

  const highlight = await queryOne(
    `INSERT INTO time_highlights (tenant_id, menu_item_id, day_of_week, start_hour, end_hour, label)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [session.tenantId, menu_item_id, day_of_week, start_hour, end_hour, label || null]
  )

  return NextResponse.json({ highlight }, { status: 201 })
}
