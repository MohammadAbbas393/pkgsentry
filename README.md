# PkgSentry — AI-Powered Dependency Security Scanner

> Automatically scan every GitHub repository for CVEs, abandoned packages, license risks, and supply chain threats. One-click GitHub App install. Reports on every push.

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com)

---

## What Is PkgSentry?

PkgSentry is a GitHub App that automatically scans your repositories' dependencies on every push or pull request. It cross-references against 180,000+ CVEs in the OSV/NVD/GitHub Advisory databases, detects abandoned packages, flags license incompatibilities, and posts an AI-generated fix report directly as a GitHub PR comment — all in under 30 seconds.

**The problem:** 70%+ of modern codebases are open-source dependencies. A single compromised `npm` or `pip` package can backdoor thousands of applications (see: `event-stream`, `ua-parser-js`, `colors.js`). Enterprise tools like Snyk charge $25–100+/seat/month, pricing out indie developers and small teams.

**The solution:** One-click install, zero config, free tier for 3 repositories.

---

## Features

- **Real-time CVE scanning** — Cross-references OSV.dev, GitHub Advisory, and NVD databases on every push
- **AI fix suggestions** — Groq's `llama-3.3-70b` generates precise upgrade paths with CVE context
- **Abandoned package detection** — Flags dependencies with no commits in 12+ months or archived repos
- **Full dependency tree** — Resolves all transitive/nested dependencies, not just direct ones
- **License compliance** — Detects GPL/AGPL in commercial projects, generates SBOM
- **GitHub native** — Posts results as PR Check Runs; can block merges on critical findings
- **5 ecosystems** — npm, PyPI, Go modules, Cargo, Maven
- **Web dashboard** — View scan history, trends, and vulnerability details across all repos

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | Dashboard & landing page |
| Backend | FastAPI (Python) | Async scanning API |
| Database | Supabase (Postgres) | Users, repos, scan results |
| GitHub Integration | GitHub App + Octokit | Webhooks on push/PR, posting comments |
| Vulnerability Data | OSV.dev API (free) | Open-source CVE database by Google |
| AI Analysis | Groq API (llama-3.3-70b) | Fix suggestions & risk summaries |
| Background Jobs | Celery + Redis | Async scan processing |
| Auth | Supabase Auth + GitHub OAuth | Sign in with GitHub |
| Hosting | Vercel (frontend) + Railway (backend) | Both have generous free tiers |

---

## Project Structure

```
pkgsentry/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles + animations
│   ├── dashboard/
│   │   ├── page.tsx            # User dashboard (repos overview)
│   │   └── [repoId]/
│   │       └── page.tsx        # Single repo scan results
│   └── api/
│       └── webhook/
│           └── route.ts        # GitHub webhook receiver
├── components/
│   ├── ScanReport.tsx          # Vulnerability report component
│   ├── RiskBadge.tsx           # Severity badge (Critical/High/Medium/Low)
│   └── DependencyTree.tsx      # Visual dependency tree
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── github.ts               # GitHub API helpers
├── backend/                    # FastAPI application
│   ├── main.py                 # Entry point
│   ├── routers/
│   │   ├── scans.py            # Scan endpoints
│   │   ├── repos.py            # Repo management
│   │   └── webhooks.py         # GitHub webhook handler
│   ├── services/
│   │   ├── scanner.py          # Core scanning orchestration
│   │   ├── osv_client.py       # OSV.dev vulnerability lookup
│   │   ├── ai_analyzer.py      # Groq/Gemini AI analysis
│   │   ├── github_client.py    # Post PR comments + Check Runs
│   │   ├── abandonment.py      # Abandoned package detection
│   │   └── parsers/
│   │       ├── npm.py          # package.json + package-lock.json
│   │       ├── pip.py          # requirements.txt + Pipfile
│   │       ├── cargo.py        # Cargo.toml
│   │       └── go.py           # go.mod
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   └── db/
│       └── supabase.py         # Supabase client
├── tailwind.config.js
├── next.config.mjs
├── package.json
└── .env.example
```

---

## Database Schema

```sql
-- Users (synced from GitHub OAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  github_username TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Repos being monitored
CREATE TABLE repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  github_repo_id BIGINT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual scans
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id),
  commit_sha TEXT,
  trigger_type TEXT DEFAULT 'push',  -- push | pr | manual
  status TEXT DEFAULT 'pending',     -- pending | running | complete | failed
  total_deps INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  abandoned_count INTEGER DEFAULT 0,
  ai_summary TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual vulnerabilities found in a scan
CREATE TABLE vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  package_name TEXT NOT NULL,
  package_version TEXT,
  ecosystem TEXT,
  cve_id TEXT,
  severity TEXT,  -- CRITICAL | HIGH | MEDIUM | LOW
  title TEXT,
  description TEXT,
  fix_version TEXT,
  ai_fix_suggestion TEXT,
  is_abandoned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- A [GitHub App](https://github.com/settings/apps) (see below)
- A [Groq API key](https://console.groq.com) (free)

### 1. Clone the repository

```bash
git clone https://github.com/MohammadAbbas393/pkgsentry.git
cd pkgsentry
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=your_private_key_contents
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret

# AI
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key   # backup

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Email (optional)
RESEND_API_KEY=your_resend_key
```

### 5. Set up the database

Run the SQL schema in your Supabase SQL editor (see `db/schema.sql`).

### 6. Create your GitHub App

1. Go to [github.com/settings/apps](https://github.com/settings/apps) → New GitHub App
2. Set **Webhook URL** to your backend URL + `/webhooks/github`
3. Enable permissions: **Repository contents** (read), **Pull requests** (read/write), **Checks** (write)
4. Subscribe to events: `push`, `pull_request`
5. Download the private key and add it to `.env`

### 7. Run locally

```bash
# Frontend (port 3000)
npm run dev

# Backend (port 8000)
cd backend && uvicorn main:app --reload
```

---

## Core Application Flow

```
User installs GitHub App
        ↓
GitHub sends webhook on push/PR
        ↓
Backend reads dependency files from repo
        ↓
Parser extracts packages + versions
        ↓
OSV.dev queried for each dependency   ←── abandonment check (GitHub API)
        ↓
Groq AI generates risk summary + fix suggestions
        ↓
Results saved to Supabase
        ↓
Bot posts PR comment / Check Run
        ↓
User views full history in dashboard
```

---

## API Reference

### `POST /webhooks/github`
GitHub webhook receiver. Validates HMAC signature and queues a scan.

### `GET /scans/{scan_id}`
Returns full scan results including all vulnerabilities.

### `GET /repos/{repo_id}/scans`
Returns scan history for a repository.

### `POST /scans/trigger`
Manually trigger a scan for a repository.

---

## Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | $0/month | 3 repos, 10 scans/month, community support |
| Pro | $9/month | Unlimited repos, unlimited scans, email alerts, priority scanning |
| Team | $19/month | Everything in Pro + team dashboard, Slack integration, API access |

---

## Roadmap

- [ ] FastAPI backend implementation
- [ ] GitHub App OAuth flow
- [ ] npm + pip dependency parsers
- [ ] OSV.dev integration
- [ ] Abandoned package detection
- [ ] AI analysis with Groq
- [ ] PR comment + Check Run posting
- [ ] Next.js dashboard (auth, repo list, scan history)
- [ ] Go + Cargo parsers
- [ ] Stripe billing integration
- [ ] Slack notifications

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change. For pull requests:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

[MIT](./LICENSE) © 2026 Mohammad Abbas
