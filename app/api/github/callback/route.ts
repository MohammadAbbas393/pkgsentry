import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const installationId = searchParams.get('installation_id')
  const setupAction = searchParams.get('setup_action')

  if (!installationId) {
    return NextResponse.redirect(new URL('/dashboard?error=no_installation', request.url))
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fetch repos for this installation from GitHub API
  let repos: any[] = []
  try {
    const appId = process.env.GITHUB_APP_ID!
    const privateKey = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n')

    // Generate JWT for GitHub App
    const { SignJWT } = await import('jose')
    const keyData = privateKey
    const encoder = new TextEncoder()
    const keyBuffer = encoder.encode(keyData)

    // Use native crypto for RS256 JWT
    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId })).toString('base64url')

    const { createSign } = await import('crypto')
    const sign = createSign('RSA-SHA256')
    sign.update(`${header}.${payload}`)
    const signature = sign.sign(privateKey, 'base64url')
    const appJwt = `${header}.${payload}.${signature}`

    // Get installation token
    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    const tokenData = await tokenRes.json()
    const installToken = tokenData.token

    // Fetch repos for this installation
    const reposRes = await fetch(
      'https://api.github.com/installation/repositories?per_page=100',
      {
        headers: {
          Authorization: `Bearer ${installToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    const reposData = await reposRes.json()
    repos = reposData.repositories ?? []
  } catch (e) {
    console.error('GitHub API error:', e)
  }

  // Store installation
  await supabase.from('github_installations').upsert({
    user_id: user.id,
    installation_id: parseInt(installationId),
    account_login: repos[0]?.owner?.login ?? '',
  }, { onConflict: 'installation_id' })

  // Store repos
  for (const repo of repos) {
    await supabase.from('repositories').upsert({
      user_id: user.id,
      installation_id: parseInt(installationId),
      github_repo_id: repo.id,
      full_name: repo.full_name,
      enabled: true,
    }, { onConflict: 'github_repo_id' })
  }

  return NextResponse.redirect(new URL('/repos', request.url))
}
