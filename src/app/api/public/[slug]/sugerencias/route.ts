import { NextResponse } from 'next/server'
import { query, queryOne } from '@/shared/lib/db'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const tenant = await queryOne(
    'SELECT id FROM tenants WHERE slug = $1 AND active = true',
    [slug]
  )
  if (!tenant) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { item_ids } = await request.json()
  if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
    return NextResponse.json({ suggestions: [] })
  }

  // 1. Reglas de upselling directas: si el cliente tiene item X, sugerir item Y
  const directSuggestions = await query(`
    SELECT DISTINCT ON (r.suggest_item_id)
      r.type, r.discount_percent, r.message,
      m.id as item_id, m.name, m.description, m.price, m.image_url, m.tags
    FROM upsell_rules r
    JOIN menu_items m ON m.id = r.suggest_item_id AND m.available = true
    WHERE r.tenant_id = $1
      AND r.active = true
      AND r.trigger_item_id = ANY($2)
      AND r.suggest_item_id != ALL($2)
    ORDER BY r.suggest_item_id, r.priority DESC
    LIMIT 5
  `, [tenant.id, item_ids])

  // 2. Time highlights: productos destacados en la franja horaria actual
  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = now.toTimeString().slice(0, 5)

  const timeHighlights = await query(`
    SELECT m.id as item_id, m.name, m.description, m.price, m.image_url, m.tags,
           h.label
    FROM time_highlights h
    JOIN menu_items m ON m.id = h.menu_item_id AND m.available = true
    WHERE h.tenant_id = $1
      AND h.active = true
      AND $2 = ANY(h.day_of_week)
      AND h.start_hour <= $3::time
      AND h.end_hour >= $3::time
      AND m.id != ALL($4)
    LIMIT 3
  `, [tenant.id, currentDay, currentTime, item_ids])

  // 3. Populares: los mas pedidos que no esten en el carrito
  const popular = await query(`
    SELECT m.id as item_id, m.name, m.description, m.price, m.image_url, m.tags,
           COUNT(oi.id) as order_count
    FROM order_items oi
    JOIN menu_items m ON m.id = oi.menu_item_id AND m.available = true
    JOIN orders o ON o.id = oi.order_id AND o.tenant_id = $1
    WHERE o.created_at > NOW() - INTERVAL '30 days'
      AND m.id != ALL($2)
    GROUP BY m.id, m.name, m.description, m.price, m.image_url, m.tags
    ORDER BY COUNT(oi.id) DESC
    LIMIT 3
  `, [tenant.id, item_ids])

  // Combinar y deduplicar
  const seen = new Set(item_ids)
  const suggestions: Array<Record<string, unknown>> = []

  for (const s of directSuggestions) {
    if (!seen.has(s.item_id)) {
      seen.add(s.item_id)
      suggestions.push({
        ...s,
        reason: s.type === 'complement' ? 'Complemento perfecto' :
                s.type === 'upgrade' ? 'Mejora tu pedido' : 'Combo especial',
      })
    }
  }

  for (const h of timeHighlights) {
    if (!seen.has(h.item_id)) {
      seen.add(h.item_id)
      suggestions.push({ ...h, type: 'highlight', reason: h.label || 'Especial ahora', discount_percent: 0 })
    }
  }

  for (const p of popular) {
    if (!seen.has(p.item_id)) {
      seen.add(p.item_id)
      suggestions.push({ ...p, type: 'popular', reason: 'Los mas pedidos', discount_percent: 0 })
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 6) })
}
