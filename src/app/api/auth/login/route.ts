import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query, queryOne } from '@/shared/lib/db'
import { createToken, setSessionCookie } from '@/shared/lib/auth'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await queryOne(
      `SELECT u.id, u.email, u.password_hash, u.name, u.role, u.tenant_id, u.active,
              t.name as tenant_name, t.slug as tenant_slug
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.email = $1`,
      [email]
    )

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    // Actualizar last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    const token = await createToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
    })
    await setSessionCookie(token)

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant_id, name: user.tenant_name, slug: user.tenant_slug },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
