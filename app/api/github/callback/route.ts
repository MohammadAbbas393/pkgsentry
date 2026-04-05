import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createSign } from 'crypto'

function makeGitHubJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId })).toString('base64url')
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${payload}`)
  const signature = sign.sign(privateKey, 'base64url')
  return `${header}.${payload}.${signature}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const installationId = searchParams.get('installation_id')

  if (!installationId) {
    return NextResponse.redirect(new URL('/dashboard?error=no_installation', request.url))
  }

  // Get logged-in user from session
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Use service role client to bypass RLS for writes
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  let repos: any[] = []
  try {
    const appId = process.env.GITHUB_APP_ID!
    const privateKey = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const appJwt = makeGitHubJwt(appId, privateKey)

    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${appJwt}`, Accept: 'application/vnd.github+json' },
      }
    )
    const tokenData = await tokenRes.json()
    const installToken = tokenData.token

    if (!installToken) {
      console.error('No install token:', tokenData)
    } else {
      const reposRes = await fetch(
        'https://api.github.com/installation/repositories?per_page=100',
        { headers: { Authorization: `Bearer ${installToken}`, Accept: 'application/vnd.github+json' } }
      )
      const reposData = await reposRes.json()
      repos = reposData.repositories ?? []
    }
  } catch (e) {
    console.error('GitHub API error:', e)
  }

  // Store installation
  await admin.from('github_installations').upsert({
    user_id: user.id,
    installation_id: parseInt(installationId),
    account_login: repos[0]?.owner?.login ?? '',
  }, { onConflict: 'installation_id' })

  // Store repos
  for (const repo of repos) {
    await admin.from('repositories').upsert({
      user_id: user.id,
      installation_id: parseInt(installationId),
      github_repo_id: repo.id,
      full_name: repo.full_name,
      enabled: true,
    }, { onConflict: 'github_repo_id' })
  }

  return NextResponse.redirect(new URL('/repos', request.url))
}
