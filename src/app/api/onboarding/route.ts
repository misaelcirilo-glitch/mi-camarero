import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { cuisine, tableCount } = await request.json()

  // Guardar settings
  await query(
    `UPDATE tenants SET settings = settings || $1 WHERE id = $2`,
    [JSON.stringify({ cuisine }), session.tenantId]
  )

  // Ajustar mesas si cambiaron
  const currentTables = await query(
    'SELECT id FROM tables WHERE tenant_id = $1',
    [session.tenantId]
  )

  if (tableCount > currentTables.length) {
    const toAdd = tableCount - currentTables.length
    for (let i = 0; i < toAdd; i++) {
      const num = currentTables.length + i + 1
      await query(
        `INSERT INTO tables (tenant_id, number, name, capacity) VALUES ($1, $2, $3, 4)`,
        [session.tenantId, num, `Mesa ${num}`]
      )
    }
  }

  return NextResponse.json({ ok: true })
}
