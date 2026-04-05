import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createSign } from 'crypto'

// --- GitHub JWT ---
function makeGitHubJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId })).toString('base64url')
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${payload}`)
  return `${header}.${payload}.${sign.sign(privateKey, 'base64url')}`
}

async function getInstallationToken(installationId: number): Promise<string> {
  const appId = process.env.GITHUB_APP_ID!
  const privateKey = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n')
  const jwt = makeGitHubJwt(appId, privateKey)
  const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json' },
  })
  const data = await res.json()
  return data.token
}

async function getFileContent(token: string, fullName: string, path: string): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${fullName}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.encoding === 'base64') return Buffer.from(data.content, 'base64').toString('utf-8')
  return null
}

// --- Package parsers ---
function parseNpm(content: string): Record<string, string> {
  try {
    const data = JSON.parse(content)
    const deps: Record<string, string> = {}
    for (const section of ['dependencies', 'devDependencies']) {
      for (const [name, ver] of Object.entries(data[section] ?? {})) {
        deps[name] = (ver as string).replace(/^[\^~>=<]+/, '').split(/[\s-]/)[0]
      }
    }
    return deps
  } catch { return {} }
}

function parseRequirements(content: string): Record<string, string> {
  const deps: Record<string, string> = {}
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    for (const sep of ['==', '>=', '<=', '~=']) {
      if (line.includes(sep)) {
        const [name, ver] = line.split(sep)
        deps[name.trim()] = ver.trim().split(',')[0]
        break
      }
    }
  }
  return deps
}

// --- OSV scanner ---
async function queryOsv(pkg: string, version: string, ecosystem: string): Promise<any[]> {
  try {
    const res = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, package: { name: pkg, ecosystem } }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    return (await res.json()).vulns ?? []
  } catch { return [] }
}

function parseSeverity(vuln: any): string {
  for (const s of vuln.severity ?? []) {
    const score = s.score ?? ''
    if (score.includes('CRITICAL')) return 'CRITICAL'
    if (score.includes('HIGH')) return 'HIGH'
  }
  for (const aff of vuln.affected ?? []) {
    const sev = String(aff.ecosystem_specific?.severity ?? '').toUpperCase()
    if (sev.includes('CRITICAL')) return 'CRITICAL'
    if (sev.includes('HIGH')) return 'HIGH'
    if (sev.includes('MEDIUM')) return 'MEDIUM'
  }
  return 'LOW'
}

async function scanPackages(packages: Record<string, string>, ecosystem: string) {
  const results = []
  for (const [pkg, ver] of Object.entries(packages)) {
    const vulns = await queryOsv(pkg, ver, ecosystem)
    for (const v of vulns) {
      const aliases = v.aliases ?? []
      const cveId = aliases.find((a: string) => a.startsWith('CVE-')) ?? v.id
      let fixVer = null
      for (const aff of v.affected ?? []) {
        for (const rng of aff.ranges ?? []) {
          for (const evt of rng.events ?? []) {
            if (evt.fixed) { fixVer = evt.fixed; break }
          }
        }
      }
      results.push({
        package: pkg, version: ver,
        severity: parseSeverity(v),
        description: (v.summary ?? v.details ?? 'No description').slice(0, 300),
        cve_id: cveId, fix_version: fixVer,
      })
    }
  }
  return results
}

// --- AI summary via Groq ---
async function generateAiSummary(vulns: any[], repoName: string): Promise<string> {
  try {
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey || vulns.length === 0) return ''
    const top = vulns.slice(0, 5).map(v => `${v.package}@${v.version}: ${v.severity} - ${v.description}`).join('\n')
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: `Summarize these security findings for ${repoName} in 2 sentences:\n${top}` }],
        max_tokens: 120,
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } catch { return '' }
}

// --- Main handler ---
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { repo_id } = await request.json()

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  // Get repo
  const { data: repo } = await admin.from('repositories').select('*').eq('id', repo_id).single()
  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  // Create scan record
  const { data: scan } = await admin.from('scans').insert({
    repo_id, user_id: user.id, status: 'running', triggered_by: 'manual',
  }).select().single()

  const scanId = scan.id

  // Run scan async (fire and forget — update DB when done)
  ;(async () => {
    try {
      const token = await getInstallationToken(repo.installation_id)
      const MANIFEST_MAP: Record<string, string> = {
        'package.json': 'npm',
        'requirements.txt': 'PyPI',
      }

      let allVulns: any[] = []
      for (const [file, ecosystem] of Object.entries(MANIFEST_MAP)) {
        const content = await getFileContent(token, repo.full_name, file)
        if (!content) continue
        const packages = file === 'package.json' ? parseNpm(content) : parseRequirements(content)
        const vulns = await scanPackages(packages, ecosystem)
        allVulns = allVulns.concat(vulns)
      }

      const summary = { critical: 0, high: 0, medium: 0, low: 0, total: allVulns.length }
      for (const v of allVulns) {
        const k = v.severity.toLowerCase() as keyof typeof summary
        if (k in summary) (summary[k] as number)++
      }

      const aiSummary = await generateAiSummary(allVulns, repo.full_name)

      await admin.from('scans').update({
        status: 'done',
        results: { vulnerabilities: allVulns, ai_summary: aiSummary },
        summary,
      }).eq('id', scanId)
    } catch (e) {
      await admin.from('scans').update({ status: 'failed' }).eq('id', scanId)
    }
  })()

  return NextResponse.json({ scan_id: scanId, status: 'running' })
}
