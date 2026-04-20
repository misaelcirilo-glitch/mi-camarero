import { NextResponse } from 'next/server'
import { queryOne } from '@/shared/lib/db'
import { createToken, setSessionCookie } from '@/shared/lib/auth'

const DEMO_EMAIL = 'demo@micamarero.es'

export async function POST() {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.role, u.tenant_id
       FROM users u
       WHERE u.email = $1
       LIMIT 1`,
      [DEMO_EMAIL]
    )

    if (!user) {
      return NextResponse.json({ error: 'Demo no disponible' }, { status: 404 })
    }

    const token = await createToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
    })

    await setSessionCookie(token)

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role, isDemo: true },
    })
  } catch (e) {
    console.error('Demo login error:', e)
    return NextResponse.json({ error: 'Error iniciando demo' }, { status: 500 })
  }
}
