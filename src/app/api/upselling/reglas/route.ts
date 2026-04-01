import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const rules = await query(`
    SELECT r.*,
           t.name as trigger_name, t.price as trigger_price,
           s.name as suggest_name, s.price as suggest_price
    FROM upsell_rules r
    JOIN menu_items t ON t.id = r.trigger_item_id
    JOIN menu_items s ON s.id = r.suggest_item_id
    WHERE r.tenant_id = $1
    ORDER BY r.priority DESC, r.created_at DESC
  `, [session.tenantId])

  return NextResponse.json({ rules })
}

const schema = z.object({
  trigger_item_id: z.string().uuid(),
  suggest_item_id: z.string().uuid(),
  type: z.enum(['complement', 'upgrade', 'combo']),
  discount_percent: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
  priority: z.number().optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { trigger_item_id, suggest_item_id, type, discount_percent, message, priority } = parsed.data

  const rule = await queryOne(
    `INSERT INTO upsell_rules (tenant_id, trigger_item_id, suggest_item_id, type, discount_percent, message, priority)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [session.tenantId, trigger_item_id, suggest_item_id, type, discount_percent || 0, message || null, priority || 0]
  )

  return NextResponse.json({ rule }, { status: 201 })
}
