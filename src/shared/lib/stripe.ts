// Stripe config — requiere STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en .env.local
// Price IDs se configuran al crear productos en Stripe Dashboard

export const STRIPE_PRICES: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
  },
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  // Dynamic import para no romper si no hay key
  const Stripe = require('stripe')
  return new Stripe(key, { apiVersion: '2024-12-18.acacia' })
}
