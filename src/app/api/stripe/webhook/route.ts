import { NextResponse } from 'next/server'
import { query, queryOne } from '@/shared/lib/db'
import { getStripe } from '@/shared/lib/stripe'

export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const tenantId = session.metadata?.tenant_id
      const planName = session.metadata?.plan
      if (tenantId && planName) {
        const plan = await queryOne('SELECT id FROM plans WHERE name = $1', [planName])
        if (plan) {
          await query(
            `UPDATE tenants SET plan_id = $1, stripe_subscription_id = $2, subscription_status = 'active' WHERE id = $3`,
            [plan.id, session.subscription, tenantId]
          )
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const tenant = await queryOne('SELECT id FROM tenants WHERE stripe_subscription_id = $1', [sub.id])
      if (tenant) {
        const statusMap: Record<string, string> = {
          active: 'active', past_due: 'past_due', canceled: 'canceled', unpaid: 'past_due',
        }
        await query(
          'UPDATE tenants SET subscription_status = $1 WHERE id = $2',
          [statusMap[sub.status] || 'active', tenant.id]
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const tenant = await queryOne('SELECT id FROM tenants WHERE stripe_subscription_id = $1', [sub.id])
      if (tenant) {
        const starterPlan = await queryOne("SELECT id FROM plans WHERE name = 'starter'")
        await query(
          `UPDATE tenants SET subscription_status = 'canceled', plan_id = $1, stripe_subscription_id = NULL WHERE id = $2`,
          [starterPlan?.id, tenant.id]
        )
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
