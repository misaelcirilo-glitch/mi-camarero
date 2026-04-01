import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { query } from '@/shared/lib/db'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  await query('DELETE FROM upsell_rules WHERE id = $1 AND tenant_id = $2', [id, session.tenantId])
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const { active } = await request.json()

  await query(
    'UPDATE upsell_rules SET active = $1 WHERE id = $2 AND tenant_id = $3',
    [active, id, session.tenantId]
  )
  return NextResponse.json({ ok: true })
}
