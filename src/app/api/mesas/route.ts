import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const tables = await query(
    `SELECT t.*,
            o.id as current_order_id, o.status as order_status, o.total as order_total
     FROM tables t
     LEFT JOIN orders o ON o.table_id = t.id AND o.status NOT IN ('paid', 'cancelled')
     WHERE t.tenant_id = $1 AND t.active = true
     ORDER BY t.number`,
    [session.tenantId]
  )

  // Obtener slug del tenant para QR URLs
  const tenant = await queryOne('SELECT slug FROM tenants WHERE id = $1', [session.tenantId])

  return NextResponse.json({ tables, slug: tenant?.slug })
}

const schema = z.object({
  number: z.number().min(1),
  name: z.string().optional(),
  capacity: z.number().min(1).optional(),
  zone: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { number, name, capacity, zone } = parsed.data

  const table = await queryOne(
    `INSERT INTO tables (tenant_id, number, name, capacity, zone)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [session.tenantId, number, name || `Mesa ${number}`, capacity || 4, zone || 'interior']
  )

  return NextResponse.json({ table }, { status: 201 })
}
