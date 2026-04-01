import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AlertTriangle, Shield, Package, FileText, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default async function ScanDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: scan } = await supabase
    .from('scans')
    .select('*, repositories(full_name)')
    .eq('id', params.id)
    .single()

  if (!scan) notFound()

  const results = scan.results as any ?? { vulnerabilities: [], abandoned: [], license_issues: [] }
  const summary = scan.summary as any ?? {}
  const repo = (scan as any).repositories?.full_name ?? '—'

  const vulns: any[] = results.vulnerabilities ?? []
  const abandoned: any[] = results.abandoned ?? []
  const licenseIssues: any[] = results.license_issues ?? []

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/dashboard/scans" className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to scans
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{repo}</h1>
        <p className="text-slate-400 text-sm mt-1">
          Scanned {new Date(scan.created_at).toLocaleString()} · {scan.triggered_by ?? 'manual'}
          {scan.commit_sha && ` · ${scan.commit_sha.slice(0, 7)}`}
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { label: 'Critical', count: summary.critical ?? 0, color: 'red' },
          { label: 'High', count: summary.high ?? 0, color: 'orange' },
          { label: 'Medium', count: summary.medium ?? 0, color: 'yellow' },
          { label: 'Low', count: summary.low ?? 0, color: 'blue' },
          { label: 'Abandoned', count: abandoned.length, color: 'purple' },
          { label: 'License', count: licenseIssues.length, color: 'pink' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`px-3 py-1.5 rounded-lg border text-sm font-medium bg-${color}-500/10 border-${color}-500/20 text-${color}-400`}>
            {count} {label}
          </div>
        ))}
        {vulns.length === 0 && abandoned.length === 0 && licenseIssues.length === 0 && (
          <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle className="w-4 h-4" />All clear — no issues found</div>
        )}
      </div>

      {/* Vulnerabilities */}
      {vulns.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />Vulnerabilities ({vulns.length})
          </h2>
          <div className="space-y-3">
            {vulns.map((v: any, i: number) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-white font-medium">{v.package}</span>
                    <span className="text-slate-500 text-sm ml-2">v{v.version}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[v.severity] ?? SEVERITY_COLORS.LOW}`}>
                    {v.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-2">{v.description}</p>
                {v.cve_id && <a href={`https://osv.dev/vulnerability/${v.cve_id}`} target="_blank" rel="noopener"
                  className="text-xs text-cyan-400 hover:underline">{v.cve_id}</a>}
                {v.fix_version && (
                  <p className="text-xs text-green-400 mt-1">Fix: upgrade to {v.fix_version}</p>
                )}
                {v.ai_summary && (
                  <div className="mt-3 bg-slate-800/60 rounded-lg px-3 py-2 text-xs text-slate-300">
                    <span className="text-cyan-400 font-medium">AI: </span>{v.ai_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Abandoned */}
      {abandoned.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />Abandoned Packages ({abandoned.length})
          </h2>
          <div className="space-y-2">
            {abandoned.map((p: any, i: number) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">{p.package}</span>
                  <p className="text-slate-500 text-xs mt-0.5">Last commit: {p.last_commit ?? 'unknown'}</p>
                </div>
                <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">Abandoned</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* License issues */}
      {licenseIssues.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-400" />License Issues ({licenseIssues.length})
          </h2>
          <div className="space-y-2">
            {licenseIssues.map((l: any, i: number) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">{l.package}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{l.license}</p>
                </div>
                <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">{l.risk ?? 'Review required'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
