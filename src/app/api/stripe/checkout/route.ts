import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { queryOne } from '@/shared/lib/db'
import { getStripe, STRIPE_PRICES } from '@/shared/lib/stripe'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe no configurado. Contacta soporte.' }, { status: 503 })

  const { plan, billing } = await request.json()
  if (!plan || !billing) return NextResponse.json({ error: 'Plan y billing requeridos' }, { status: 400 })

  const prices = STRIPE_PRICES[plan]
  if (!prices) return NextResponse.json({ error: 'Plan no valido' }, { status: 400 })

  const priceId = billing === 'yearly' ? prices.yearly : prices.monthly

  const tenant = await queryOne(
    'SELECT id, name, email, stripe_customer_id FROM tenants WHERE id = $1',
    [session.tenantId]
  )

  // Crear o reutilizar customer de Stripe
  let customerId = tenant?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant?.email || session.email,
      name: tenant?.name,
      metadata: { tenant_id: session.tenantId },
    })
    customerId = customer.id
    await queryOne('UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2', [customerId, session.tenantId])
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/planes?success=true`,
    cancel_url: `${appUrl}/planes?canceled=true`,
    metadata: { tenant_id: session.tenantId, plan },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
