import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { id } = await params
  const body = await request.json()

  const fields: string[] = []; const values: unknown[] = []; let idx = 1
  for (const [key, val] of Object.entries(body)) {
    if (['name', 'email', 'phone', 'notes', 'tags', 'points'].includes(key) && val !== undefined) {
      fields.push(`${key} = $${idx}`); values.push(val); idx++
    }
  }
  if (fields.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  values.push(id, session.tenantId)
  const customer = await queryOne(`UPDATE customers SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`, values)
  if (!customer) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ customer })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { id } = await params
  await query('DELETE FROM customers WHERE id = $1 AND tenant_id = $2', [id, session.tenantId])
  return NextResponse.json({ ok: true })
}
