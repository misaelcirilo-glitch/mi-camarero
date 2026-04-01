import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q')
  const sort = searchParams.get('sort') || 'last_visit'

  let sql = `
    SELECT c.*,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_name = c.name AND o.tenant_id = c.tenant_id) as orders_count
    FROM customers c WHERE c.tenant_id = $1
  `
  const params: unknown[] = [session.tenantId]

  if (search) {
    sql += ` AND (c.name ILIKE $2 OR c.email ILIKE $2 OR c.phone ILIKE $2)`
    params.push(`%${search}%`)
  }

  const sortMap: Record<string, string> = {
    last_visit: 'c.last_visit DESC NULLS LAST',
    total_spent: 'c.total_spent DESC',
    points: 'c.points DESC',
    name: 'c.name ASC',
    visit_count: 'c.visit_count DESC',
  }
  sql += ` ORDER BY ${sortMap[sort] || sortMap.last_visit} LIMIT 100`

  const customers = await query(sql, params)

  // Stats
  const stats = await queryOne(`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE last_visit > NOW() - INTERVAL '30 days') as active_30d,
           COALESCE(SUM(total_spent), 0) as total_revenue, COALESCE(AVG(total_spent), 0) as avg_spent
    FROM customers WHERE tenant_id = $1
  `, [session.tenantId])

  return NextResponse.json({ customers, stats })
}

const schema = z.object({
  name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(),
  notes: z.string().optional(), tags: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { name, email, phone, notes, tags } = parsed.data
  const customer = await queryOne(
    `INSERT INTO customers (tenant_id, name, email, phone, notes, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [session.tenantId, name, email || null, phone || null, notes || null, tags || []]
  )
  return NextResponse.json({ customer }, { status: 201 })
}
