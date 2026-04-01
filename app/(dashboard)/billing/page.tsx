import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/stripe'
import { CreditCard, Check, Zap, Shield, Users } from 'lucide-react'

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, repo_limit')
    .eq('user_id', user!.id)
    .single()

  const currentPlan = (sub?.plan as keyof typeof PLANS) ?? 'free'

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-1">
          Current plan: <span className="text-cyan-400 font-medium capitalize">{currentPlan}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const isCurrent = key === currentPlan
          const icons = { free: Shield, pro: Zap, team: Users }
          const Icon = icons[key]
          return (
            <div key={key}
              className={`rounded-xl border p-6 ${isCurrent ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="font-semibold text-white">{plan.name}</span>
                {isCurrent && <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">Current</span>}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <form action="/api/billing/checkout" method="POST">
                  <input type="hidden" name="plan" value={key} />
                  <button type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold py-2 rounded-lg text-sm transition-colors">
                    Upgrade to {plan.name}
                  </button>
                </form>
              )}
              {isCurrent && plan.price > 0 && (
                <form action="/api/billing/portal" method="POST">
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium py-2 rounded-lg text-sm transition-colors">
                    <CreditCard className="w-4 h-4" />Manage subscription
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
