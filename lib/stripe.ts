import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder', {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    repoLimit: 1,
    features: ['1 repository', 'Manual scans only', 'Email alerts'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    repoLimit: 10,
    features: ['10 repositories', 'Auto-scan on push', 'PR comments', 'Priority support'],
  },
  team: {
    name: 'Team',
    price: 49,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    repoLimit: -1,
    features: ['Unlimited repositories', 'Auto-scan on push', 'PR comments', 'SBOM export', 'Priority support'],
  },
} as const

export type Plan = keyof typeof PLANS
