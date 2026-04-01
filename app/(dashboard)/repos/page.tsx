import { createClient } from '@/lib/supabase/server'
import RepoList from '@/components/RepoList'

export default async function ReposPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: repos }, { data: sub }] = await Promise.all([
    supabase.from('repositories').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('plan, repo_limit').eq('user_id', user!.id).single(),
  ])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Repositories</h1>
        <p className="text-slate-400 text-sm mt-1">Manage which repos PkgSentry scans</p>
      </div>
      <RepoList repos={repos ?? []} plan={sub?.plan ?? 'free'} repoLimit={sub?.repo_limit ?? 1} userId={user!.id} />
    </div>
  )
}
