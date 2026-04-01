import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { query, queryOne } from '@/shared/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category_id')

  let sql = `
    SELECT m.*, c.name as category_name,
           COALESCE(json_agg(
             json_build_object('id', e.id, 'name', e.name, 'price', e.price, 'active', e.active)
           ) FILTER (WHERE e.id IS NOT NULL), '[]') as extras
    FROM menu_items m
    LEFT JOIN menu_categories c ON c.id = m.category_id
    LEFT JOIN menu_item_extras e ON e.item_id = m.id
    WHERE m.tenant_id = $1
  `
  const params: unknown[] = [session.tenantId]

  if (categoryId) {
    sql += ` AND m.category_id = $2`
    params.push(categoryId)
  }

  sql += ` GROUP BY m.id, c.name ORDER BY m.position, m.name`

  const items = await query(sql, params)
  return NextResponse.json({ items })
}

const schema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'Precio debe ser positivo'),
  image_url: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  calories: z.number().optional(),
  prep_time_min: z.number().optional(),
  featured: z.boolean().optional(),
  extras: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
  })).optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  // Verificar límite del plan
  const planCheck = await queryOne(`
    SELECT COUNT(m.id) as current_count, p.max_menu_items
    FROM tenants t
    JOIN plans p ON p.id = t.plan_id
    LEFT JOIN menu_items m ON m.tenant_id = t.id
    WHERE t.id = $1
    GROUP BY p.max_menu_items
  `, [session.tenantId])

  if (planCheck && Number(planCheck.current_count) >= Number(planCheck.max_menu_items)) {
    return NextResponse.json({
      error: `Has alcanzado el limite de ${planCheck.max_menu_items} platos de tu plan. Mejora tu plan para añadir mas.`
    }, { status: 403 })
  }

  const { extras, ...itemData } = parsed.data

  const maxPos = await queryOne(
    'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM menu_items WHERE tenant_id = $1',
    [session.tenantId]
  )

  const item = await queryOne(
    `INSERT INTO menu_items (tenant_id, category_id, name, description, price, image_url, allergens, tags, calories, prep_time_min, featured, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      session.tenantId, itemData.category_id || null, itemData.name, itemData.description || null,
      itemData.price, itemData.image_url || null, itemData.allergens || [], itemData.tags || [],
      itemData.calories || null, itemData.prep_time_min || 15, itemData.featured || false,
      maxPos?.next_pos || 0
    ]
  )

  // Crear extras si hay
  if (extras && extras.length > 0) {
    for (let i = 0; i < extras.length; i++) {
      await query(
        'INSERT INTO menu_item_extras (item_id, name, price, position) VALUES ($1, $2, $3, $4)',
        [item!.id, extras[i].name, extras[i].price, i]
      )
    }
  }

  return NextResponse.json({ item }, { status: 201 })
}
