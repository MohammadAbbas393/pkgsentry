import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, AlertTriangle, GitBranch, CheckCircle, ArrowRight, Plus, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: repos }, { data: recentScans }, { data: sub }] = await Promise.all([
    supabase.from('repositories').select('*').eq('user_id', user!.id).eq('enabled', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('scans').select('*, repositories(full_name)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('subscriptions').select('plan, repo_limit').eq('user_id', user!.id).single(),
  ])

  const plan = sub?.plan ?? 'free'
  const repoLimit = sub?.repo_limit ?? 1
  const totalCritical = recentScans?.reduce((acc, s) => acc + ((s.summary as any)?.critical ?? 0), 0) ?? 0
  const totalHigh = recentScans?.reduce((acc, s) => acc + ((s.summary as any)?.high ?? 0), 0) ?? 0

  const hasGithubApp = (repos?.length ?? 0) > 0

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Security status across your repositories</p>
        </div>
        {!hasGithubApp && (
          <Link href={`https://github.com/apps/pkgsentry/installations/new`}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />Install GitHub App
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Repositories', value: repos?.length ?? 0, icon: GitBranch, color: 'cyan' },
          { label: 'Critical CVEs', value: totalCritical, icon: AlertTriangle, color: 'red' },
          { label: 'High Severity', value: totalHigh, icon: Shield, color: 'orange' },
          { label: 'Scans Run', value: recentScans?.length ?? 0, icon: CheckCircle, color: 'green' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* No GitHub App CTA */}
      {!hasGithubApp && (
        <div className="bg-slate-900/80 border border-dashed border-slate-700 rounded-xl p-10 text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Connect your GitHub repositories</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Install the PkgSentry GitHub App to start scanning your repos for CVEs, abandoned packages, and license risks.</p>
          <Link href={`https://github.com/apps/pkgsentry/installations/new`}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />Install GitHub App
          </Link>
        </div>
      )}

      {/* Recent scans */}
      {(recentScans?.length ?? 0) > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />Recent Scans
            </h2>
            <Link href="/dashboard/scans" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentScans!.map(scan => {
              const summary = scan.summary as any ?? {}
              const repo = (scan as any).repositories?.full_name ?? 'Unknown'
              const hasIssues = (summary.critical ?? 0) + (summary.high ?? 0) > 0
              return (
                <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}
                  className="flex items-center px-5 py-3.5 hover:bg-slate-800/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{repo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(scan.created_at).toLocaleDateString()} · {scan.triggered_by ?? 'manual'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {summary.critical > 0 && <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">{summary.critical} critical</span>}
                    {summary.high > 0 && <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">{summary.high} high</span>}
                    {!hasIssues && scan.status === 'done' && <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Clean</span>}
                    {scan.status === 'running' && <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Scanning…</span>}
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Plan limit */}
      <div className="mt-6 flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-4">
        <div>
          <p className="text-sm font-medium text-white capitalize">{plan} plan</p>
          <p className="text-xs text-slate-500">{repos?.length ?? 0} / {repoLimit === -1 ? '∞' : repoLimit} repositories</p>
        </div>
        {plan !== 'team' && (
          <Link href="/dashboard/billing" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Upgrade →
          </Link>
        )}
      </div>
    </div>
  )
}
