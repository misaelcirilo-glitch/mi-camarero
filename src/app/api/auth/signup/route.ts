import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query, queryOne } from '@/shared/lib/db'
import { createToken, setSessionCookie } from '@/shared/lib/auth'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  restaurantName: z.string().min(2, 'Nombre del restaurante requerido'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password, name, restaurantName } = parsed.data

    // Check email único
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
    }

    // Crear slug desde nombre del restaurante
    const slug = restaurantName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Verificar slug único
    const existingSlug = await queryOne('SELECT id FROM tenants WHERE slug = $1', [slug])
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug

    // Obtener plan Starter por defecto
    const starterPlan = await queryOne('SELECT id FROM plans WHERE name = $1', ['starter'])

    // Crear tenant
    const tenant = await queryOne(
      `INSERT INTO tenants (name, slug, plan_id) VALUES ($1, $2, $3) RETURNING id`,
      [restaurantName, finalSlug, starterPlan?.id]
    )

    // Crear usuario owner
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await queryOne(
      `INSERT INTO users (tenant_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, 'owner') RETURNING id, role`,
      [tenant!.id, email, passwordHash, name]
    )

    // Crear 5 mesas por defecto
    const tableInserts = Array.from({ length: 5 }, (_, i) =>
      query(
        `INSERT INTO tables (tenant_id, number, name, capacity) VALUES ($1, $2, $3, $4)`,
        [tenant!.id, i + 1, `Mesa ${i + 1}`, 4]
      )
    )
    await Promise.all(tableInserts)

    // JWT
    const token = await createToken({
      userId: user!.id,
      tenantId: tenant!.id,
      role: user!.role,
      email,
    })
    await setSessionCookie(token)

    return NextResponse.json({
      user: { id: user!.id, name, email, role: user!.role },
      tenant: { id: tenant!.id, name: restaurantName, slug: finalSlug },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
