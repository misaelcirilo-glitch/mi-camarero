import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const rewards = await query(
    `SELECT r.*, m.name as item_name FROM loyalty_rewards r LEFT JOIN menu_items m ON m.id = r.reward_item_id WHERE r.tenant_id = $1 ORDER BY r.points_required`,
    [session.tenantId]
  )
  return NextResponse.json({ rewards })
}

const schema = z.object({
  name: z.string().min(1), description: z.string().optional(), points_required: z.number().min(1),
  reward_type: z.enum(['discount_percent', 'discount_amount', 'free_item']),
  reward_value: z.number().optional(), reward_item_id: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { name, description, points_required, reward_type, reward_value, reward_item_id } = parsed.data
  const reward = await queryOne(
    `INSERT INTO loyalty_rewards (tenant_id, name, description, points_required, reward_type, reward_value, reward_item_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [session.tenantId, name, description || null, points_required, reward_type, reward_value || null, reward_item_id || null]
  )
  return NextResponse.json({ reward }, { status: 201 })
}
