import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
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
    repoLimit: -1, // unlimited
    features: ['Unlimited repositories', 'Auto-scan on push', 'PR comments', 'SBOM export', 'Priority support'],
  },
} as const

export type Plan = keyof typeof PLANS
