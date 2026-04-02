'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GitBranch, Play, ToggleLeft, ToggleRight, Loader2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

interface Repo {
  id: string
  full_name: string
  enabled: boolean
  created_at: string
}

export default function RepoList({ repos, plan, repoLimit, userId }: {
  repos: Repo[]
  plan: string
  repoLimit: number
  userId: string
}) {
  const supabase = createClient()
  const [list, setList] = useState(repos)
  const [scanning, setScanning] = useState<string | null>(null)

  const enabledCount = list.filter(r => r.enabled).length
  const atLimit = repoLimit !== -1 && enabledCount >= repoLimit

  async function toggleRepo(id: string, current: boolean) {
    if (!current && atLimit) return
    await supabase.from('repositories').update({ enabled: !current }).eq('id', id)
    setList(l => l.map(r => r.id === id ? { ...r, enabled: !current } : r))
  }

  async function triggerScan(repoId: string) {
    setScanning(repoId)
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId, triggered_by: 'manual' }),
    })
    setScanning(null)
  }

  if (list.length === 0) {
    return (
      <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
        <GitBranch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">No repositories yet</p>
        <p className="text-slate-500 text-sm mb-4">Install the GitHub App to connect your repos</p>
        <Link href="https://github.com/apps/pkgsentry/installations/new"
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <LinkIcon className="w-4 h-4" />Install GitHub App
        </Link>
      </div>
    )
  }

  return (
    <div>
      {atLimit && (
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-yellow-400 text-sm">
          You've reached the {repoLimit}-repo limit on your {plan} plan.{' '}
          <Link href="/billing" className="underline">Upgrade to add more.</Link>
        </div>
      )}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800">
          {list.map(repo => (
            <div key={repo.id} className="flex items-center px-5 py-4 gap-4">
              <GitBranch className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-sm text-white font-medium flex-1">{repo.full_name}</span>
              <button onClick={() => triggerScan(repo.id)} disabled={scanning === repo.id || !repo.enabled}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 disabled:opacity-40 transition-colors border border-slate-700 hover:border-cyan-500/40 px-3 py-1.5 rounded-lg">
                {scanning === repo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Scan now
              </button>
              <button onClick={() => toggleRepo(repo.id, repo.enabled)}
                disabled={!repo.enabled && atLimit}
                className="disabled:opacity-40 transition-colors">
                {repo.enabled
                  ? <ToggleRight className="w-8 h-8 text-cyan-400" />
                  : <ToggleLeft className="w-8 h-8 text-slate-600" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
