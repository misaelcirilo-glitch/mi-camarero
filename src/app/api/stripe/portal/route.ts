import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { queryOne } from '@/shared/lib/db'
import { getStripe } from '@/shared/lib/stripe'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })

  const tenant = await queryOne('SELECT stripe_customer_id FROM tenants WHERE id = $1', [session.tenantId])
  if (!tenant?.stripe_customer_id) {
    return NextResponse.json({ error: 'No hay suscripcion activa' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id,
    return_url: `${appUrl}/planes`,
  })

  return NextResponse.json({ url: portalSession.url })
}
