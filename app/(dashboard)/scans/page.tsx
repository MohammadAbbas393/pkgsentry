import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Scan, ArrowRight, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react'

export default async function ScansPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: scans } = await supabase
    .from('scans')
    .select('*, repositories(full_name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Scan History</h1>

      {!scans?.length ? (
        <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
          <Scan className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No scans yet</p>
          <p className="text-slate-500 text-sm">Enable a repository and trigger your first scan</p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {scans.map(scan => {
              const summary = scan.summary as any ?? {}
              const repo = (scan as any).repositories?.full_name ?? '—'
              const critical = summary.critical ?? 0
              const high = summary.high ?? 0
              const clean = scan.status === 'done' && critical === 0 && high === 0
              return (
                <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}
                  className="flex items-center px-5 py-4 hover:bg-slate-800/50 transition-colors group">
                  <div className="mr-4">
                    {scan.status === 'done' && clean && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {scan.status === 'done' && !clean && <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {scan.status === 'running' && <Clock className="w-5 h-5 text-blue-400 animate-pulse" />}
                    {scan.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{repo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(scan.created_at).toLocaleString()} · {scan.triggered_by ?? 'manual'}
                      {scan.commit_sha && ` · ${scan.commit_sha.slice(0, 7)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {critical > 0 && <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">{critical} critical</span>}
                    {high > 0 && <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">{high} high</span>}
                    {clean && <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Clean</span>}
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 ml-2 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
