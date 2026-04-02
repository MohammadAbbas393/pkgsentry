# PkgSentry

AI-powered dependency security scanner for GitHub repositories. Connect your repos, and PkgSentry automatically scans every dependency for CVEs, abandoned packages, and license risks — then gives you an AI-generated summary with fix suggestions.

## What It Does

- **Automatic scanning** — installs as a GitHub App and scans on every push
- **CVE detection** — checks all packages against the OSV.dev vulnerability database (npm, PyPI, Go, Cargo, and more)
- **Abandoned package detection** — flags packages that are no longer maintained
- **License risk analysis** — identifies licenses that may conflict with your project
- **AI-generated fix summaries** — uses Groq (llama-3.3-70b) to summarize critical findings and suggest remediation steps
- **Manual scans** — trigger a scan on demand from the dashboard without waiting for a push event

## Pricing

| Plan | Price | Repos | Scanning |
|------|-------|-------|----------|
| Free | $0/mo | 1 repo | Manual only |
| Pro | $19/mo | 10 repos | Auto on push |
| Team | $49/mo | Unlimited | Auto on push |

## Tech Stack

- **Frontend** — Next.js 14 (App Router), Tailwind CSS, deployed on Vercel
- **Backend** — FastAPI (Python 3.11), deployed on Railway
- **Database & Auth** — Supabase (Postgres + Auth)
- **Payments** — Stripe (subscriptions, billing portal, webhooks)
- **AI** — Groq API (llama-3.3-70b) for scan summaries
- **Scanning** — OSV.dev API for CVE lookups, GitHub App for repository access

## Architecture

```
User → Vercel (Next.js frontend)
         ├── /login, /signup       ← Supabase Auth (email + OAuth)
         ├── /dashboard            ← overview, stats, recent scans
         ├── /repos                ← manage connected repositories
         ├── /scans                ← full scan history
         ├── /scans/[id]           ← detailed scan results
         ├── /billing              ← Stripe subscription management
         └── /settings             ← account settings
                  ↓
         Railway (FastAPI backend)
         ├── POST /scan            ← trigger a scan job
         ├── GET /scan/{id}        ← fetch scan results
         └── POST /webhooks/github ← receive GitHub push events
                  ↓
         Supabase (Postgres)
         ├── subscriptions
         ├── github_installations
         ├── repositories
         └── scans
```

## Dashboard Pages

**Dashboard** — summary of connected repos, recent scans, vulnerability counts across all monitored repos

**Repositories** — enable or disable scanning per repo, trigger manual scans

**Scan Results** — each scan shows total packages scanned, CVEs by severity (Critical / High / Medium / Low), abandoned packages, license risks, and an AI-generated fix summary

**Billing** — self-serve upgrade, downgrade, and cancellation via Stripe; customers manage their payment method and download invoices without contacting support

**Settings** — update profile and change password

## How Users Get Started

1. Sign up at the website
2. Choose a plan (free plan available)
3. Install the PkgSentry GitHub App on their account or organization
4. Select which repositories to monitor
5. Push to any enabled repo — PkgSentry scans automatically and shows results in the dashboard

## Local Development

### Prerequisites
- Node.js 18+, Python 3.11
- Supabase project, Stripe account, Groq API key, GitHub App

### Frontend
```bash
cd pkgsentry
npm install
npm run dev        # runs on localhost:3001
```

### Backend
```bash
cd pkgsentry/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
STRIPE_TEAM_PRICE_ID
GITHUB_APP_ID
GITHUB_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GROQ_API_KEY
NEXT_PUBLIC_APP_URL
BACKEND_URL
```

## Deployment

- **Frontend**: Vercel — auto-deploys from the main branch
- **Backend**: Railway — auto-deploys from the main branch, Python 3.11 pinned via `.python-version`
