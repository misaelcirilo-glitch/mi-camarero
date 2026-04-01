import { NextResponse } from 'next/server'
import { query, queryOne } from '@/shared/lib/db'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const tenant = await queryOne(
    `SELECT t.id, t.name, t.slug, t.logo_url, t.phone, t.currency, t.settings
     FROM tenants t WHERE t.slug = $1 AND t.active = true`,
    [slug]
  )

  if (!tenant) {
    return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  const categories = await query(
    `SELECT id, name, description, icon, position
     FROM menu_categories
     WHERE tenant_id = $1 AND active = true
     ORDER BY position, name`,
    [tenant.id]
  )

  const items = await query(
    `SELECT m.id, m.category_id, m.name, m.description, m.price, m.image_url,
            m.allergens, m.tags, m.calories, m.prep_time_min, m.featured,
            COALESCE(json_agg(
              json_build_object('id', e.id, 'name', e.name, 'price', e.price)
            ) FILTER (WHERE e.id IS NOT NULL), '[]') as extras
     FROM menu_items m
     LEFT JOIN menu_item_extras e ON e.item_id = m.id AND e.active = true
     WHERE m.tenant_id = $1 AND m.available = true
     GROUP BY m.id
     ORDER BY m.featured DESC, m.position, m.name`,
    [tenant.id]
  )

  return NextResponse.json({
    restaurant: {
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo_url,
      phone: tenant.phone,
      currency: tenant.currency,
      settings: tenant.settings,
    },
    categories,
    items,
  })
}
