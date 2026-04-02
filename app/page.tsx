'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import {
  Shield,
  Search,
  GitBranch,
  Zap,
  AlertTriangle,
  Lock,
  CheckCircle,
  ArrowRight,
  Github,
  Terminal,
  Package,
  Eye,
  BarChart3,
  Bell,
  Star,
  Code2,
  GitPullRequest,
  Cpu,
  X,
  Check,
  ExternalLink,
  ChevronRight,
  Layers,
  Activity,
  TrendingUp,
  Sparkles,
  Globe,
  RefreshCw,
} from 'lucide-react'

// ─────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────
const easeOut = [0.22, 1, 0.36, 1]

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
}

const stagger = (delay = 0.1) => ({
  initial: {},
  animate: { transition: { staggerChildren: delay } },
})

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
}

// ─────────────────────────────────────────────
// MATRIX RAIN
// ─────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const chars =
      'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF@#$%^&*{}[]<>?/\\'
    const fontSize = 13
    let columns = Math.floor(canvas.width / fontSize)
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * -50)

    const draw = () => {
      ctx.fillStyle = 'rgba(2,8,23,0.055)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const y = drops[i] * fontSize
        const progress = y / canvas.height

        if (progress < 0.05) {
          ctx.fillStyle = 'rgba(240,253,255,0.95)'
        } else {
          const opacity = Math.max(0.03, (1 - progress) * 0.5)
          ctx.fillStyle = `rgba(34,211,238,${opacity})`
        }

        ctx.fillText(char, i * fontSize, y)

        if (y > canvas.height && Math.random() > 0.974) {
          drops[i] = 0
        }
        drops[i] += 0.5
      }
    }

    const id = setInterval(draw, 45)

    const onResize = () => {
      resize()
      columns = Math.floor(canvas.width / fontSize)
      drops = Array(columns).fill(0).map(() => Math.random() * -50)
    }
    window.addEventListener('resize', onResize)

    return () => {
      clearInterval(id)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-[0.14]"
      style={{ pointerEvents: 'none' }}
    />
  )
}

// ─────────────────────────────────────────────
// ANIMATED TERMINAL
// ─────────────────────────────────────────────
type LineType =
  | 'command'
  | 'blank'
  | 'info'
  | 'muted'
  | 'progress'
  | 'critical'
  | 'high'
  | 'medium'
  | 'detail'
  | 'fix'
  | 'abandoned'
  | 'divider'
  | 'summary'
  | 'success'

interface ScanLine {
  text: string
  type: LineType
  delay: number
}

const SCAN_LINES: ScanLine[] = [
  { text: '$ pkgsentry scan --repo ./my-app --pr 142', type: 'command', delay: 200 },
  { text: '', type: 'blank', delay: 600 },
  { text: '◉  Reading package.json ...', type: 'info', delay: 700 },
  { text: '   Found 47 direct dependencies', type: 'muted', delay: 1100 },
  { text: '', type: 'blank', delay: 1200 },
  { text: '◉  Building dependency tree ...', type: 'info', delay: 1300 },
  { text: '   [████████████████████████] 203 packages total', type: 'progress', delay: 2100 },
  { text: '', type: 'blank', delay: 2200 },
  { text: '◉  Querying OSV vulnerability database ...', type: 'info', delay: 2400 },
  { text: '', type: 'blank', delay: 2800 },
  { text: '   ■ CRITICAL  lodash@4.17.20', type: 'critical', delay: 3000 },
  { text: '     CVE-2021-23337 · Command injection via template', type: 'detail', delay: 3200 },
  { text: '     ↳ Upgrade to 4.17.21 (patch available)', type: 'fix', delay: 3400 },
  { text: '', type: 'blank', delay: 3500 },
  { text: '   ▲ HIGH      axios@0.21.1', type: 'high', delay: 3700 },
  { text: '     SSRF vulnerability in redirect handling', type: 'detail', delay: 3900 },
  { text: '     ↳ Upgrade to 1.6.8 (latest stable)', type: 'fix', delay: 4100 },
  { text: '', type: 'blank', delay: 4200 },
  { text: '   ● MEDIUM    minimist@1.2.5', type: 'medium', delay: 4400 },
  { text: '     Prototype pollution via constructor', type: 'detail', delay: 4600 },
  { text: '     ↳ Upgrade to 1.2.8', type: 'fix', delay: 4800 },
  { text: '', type: 'blank', delay: 4900 },
  { text: '◉  Detecting abandoned packages ...', type: 'info', delay: 5100 },
  { text: '   ⊗  event-stream@3.3.6 — last commit 5 years ago', type: 'abandoned', delay: 5700 },
  { text: '', type: 'blank', delay: 5800 },
  { text: '◉  Generating AI risk summary ...', type: 'info', delay: 6000 },
  { text: '', type: 'blank', delay: 6700 },
  { text: '   ────────────────────────────────────────', type: 'divider', delay: 6800 },
  { text: '   1 Critical  ·  2 High  ·  3 Medium  ·  6 Low', type: 'summary', delay: 6900 },
  { text: '   1 abandoned  ·  0 license conflicts', type: 'summary', delay: 7000 },
  { text: '   ────────────────────────────────────────', type: 'divider', delay: 7100 },
  { text: '', type: 'blank', delay: 7200 },
  { text: '✓  Report posted to PR #142', type: 'success', delay: 7400 },
]

const lineColor: Record<LineType, string> = {
  command: 'text-white font-bold',
  blank: '',
  info: 'text-cyan-400',
  muted: 'text-slate-500',
  progress: 'text-cyan-300',
  critical: 'text-red-400 font-semibold',
  high: 'text-orange-400 font-semibold',
  medium: 'text-yellow-400 font-semibold',
  detail: 'text-slate-400 text-[11px]',
  fix: 'text-emerald-400 text-[11px]',
  abandoned: 'text-orange-300',
  divider: 'text-slate-700',
  summary: 'text-slate-300 text-[11px]',
  success: 'text-emerald-400 font-semibold',
}

function TerminalWindow() {
  const [visible, setVisible] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const started = useRef(false)

  useEffect(() => {
    if (!isInView || started.current) return
    started.current = true

    SCAN_LINES.forEach((line, idx) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, idx])
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
        if (idx === SCAN_LINES.length - 1) setDone(true)
      }, line.delay)
    })
  }, [isInView])

  return (
    <div ref={ref} className="terminal rounded-2xl shadow-2xl shadow-cyan-500/10 w-full">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-cyan-900/30 bg-slate-950/70">
        <div className="flex gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-slate-500 text-xs font-mono flex-1">
          pkgsentry — bash — 90×30
        </span>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-emerald-400 text-[11px] font-mono tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        className="p-5 h-[360px] overflow-y-auto scrollbar-none leading-[1.65]"
      >
        {visible.map((idx) => {
          const line = SCAN_LINES[idx]
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className={`font-mono text-[12px] whitespace-pre ${lineColor[line.type]}`}
            >
              {line.text || '\u00A0'}
            </motion.div>
          )
        })}

        {!done && started.current && (
          <span className="text-cyan-400 font-mono text-sm animate-blink">█</span>
        )}
        {done && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cyan-400 font-mono text-sm animate-blink"
          >
            █
          </motion.span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────
function Counter({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  target: number
  suffix?: string
  prefix?: string
  decimals?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 1800
    const steps = 72
    const step = target / steps
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + step, target)
      setCount(parseFloat(cur.toFixed(decimals)))
      if (cur >= target) clearInterval(id)
    }, duration / steps)
    return () => clearInterval(id)
  }, [isInView, target, decimals])

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

// ─────────────────────────────────────────────
// FLOATING BADGE (decorative)
// ─────────────────────────────────────────────
function FloatingBadge({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute glass-bright rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Features', 'How it works', 'Pricing', 'Docs']

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOut, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#020817]/90 backdrop-blur-2xl border-b border-slate-800/60 shadow-2xl shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }}>
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Shield className="w-4.5 h-4.5 text-cyan-400" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-lg bg-cyan-400/10 blur-md"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          <span className="font-bold text-[1.2rem] tracking-tight">
            <span className="text-white">Pkg</span>
            <span className="text-cyan-400">Sentry</span>
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-mono text-cyan-400/60 border border-cyan-400/20 rounded px-1.5 py-0.5 bg-cyan-400/5">
            BETA
          </span>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <motion.a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
              whileHover={{ y: -1 }}
            >
              {l}
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            whileHover={{ rotate: 5, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Github className="w-5 h-5" />
          </motion.a>
          <motion.a
            href="/signup"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Install Free
          </motion.a>
        </div>
      </div>
    </motion.nav>
  )
}

// ─────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────
function Section({
  children,
  id,
  className = '',
}: {
  children: React.ReactNode
  id?: string
  className?: string
}) {
  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      {children}
    </section>
  )
}

// ─────────────────────────────────────────────
// FEATURE CARD
// ─────────────────────────────────────────────
interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  color: string
}

const features: Feature[] = [
  {
    icon: <Search className="w-5 h-5" />,
    title: 'Real-time CVE Scanning',
    description:
      'Cross-references every dependency against OSV.dev, GitHub Advisory, and NVD databases. 180K+ vulnerabilities indexed.',
    badge: '180K+ CVEs',
    color: 'text-cyan-400',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'AI Fix Suggestions',
    description:
      "Groq-powered AI generates precise upgrade paths. 'Upgrade lodash from 4.17.20 → 4.17.21 to patch CVE-2021-23337.'",
    badge: 'AI-powered',
    color: 'text-purple-400',
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Abandoned Package Detection',
    description:
      'Flags dependencies with no commits in 12+ months, archived repos, and single-maintainer supply chain risks.',
    badge: 'Supply chain',
    color: 'text-orange-400',
  },
  {
    icon: <GitPullRequest className="w-5 h-5" />,
    title: 'PR Comment Reports',
    description:
      'Posts a rich security report as a GitHub Check Run on every PR. Block merges until critical issues are resolved.',
    badge: 'GitHub native',
    color: 'text-emerald-400',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Full Dependency Tree',
    description:
      'Resolves all transitive/nested dependencies across npm, pip, Go modules, Cargo, and Maven ecosystems.',
    badge: '5 ecosystems',
    color: 'text-blue-400',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'License Compliance',
    description:
      'Automatically flags GPL/AGPL licenses in commercial projects. Generates a complete SBOM for audit trails.',
    badge: 'Compliance',
    color: 'text-pink-400',
  },
]

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-50, 50], [5, -5]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-50, 50], [-5, 5]), { stiffness: 300, damping: 30 })

  const onMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      x.set(e.clientX - rect.left - rect.width / 2)
      y.set(e.clientY - rect.top - rect.height / 2)
    },
    [x, y]
  )

  const onLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: easeOut, delay: index * 0.08 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={onMouse}
      onMouseLeave={onLeave}
      className="group relative glass rounded-2xl p-6 card-hover border border-slate-800/50 cursor-default"
    >
      {/* Gradient hover overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color} bg-current/10 border border-current/20`}
          style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}
        >
          <span className={feature.color}>{feature.icon}</span>
        </div>
        {feature.badge && (
          <span className="text-[10px] font-mono text-slate-500 border border-slate-700/60 rounded-full px-2 py-0.5 bg-slate-900/50">
            {feature.badge}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-white mb-2 text-[15px]">{feature.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>

      <div className="mt-4 flex items-center gap-1 text-xs text-slate-600 group-hover:text-cyan-400/60 transition-colors">
        <span>Learn more</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// SEVERITY BADGE
// ─────────────────────────────────────────────
function SeverityBadge({ level }: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const map = {
    critical: { cls: 'badge-critical', label: 'CRITICAL' },
    high: { cls: 'badge-high', label: 'HIGH' },
    medium: { cls: 'badge-medium', label: 'MEDIUM' },
    low: { cls: 'badge-low', label: 'LOW' },
  }
  const { cls, label } = map[level]
  return (
    <span className={`${cls} text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider`}>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Home() {
  const [billingAnnual, setBillingAnnual] = useState(false)
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const prices = {
    pro: billingAnnual ? 7 : 9,
    team: billingAnnual ? 15 : 19,
  }

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 via-emerald-400 to-purple-500 z-[100]"
        style={{ width: progressWidth }}
      />

      <Nav />

      {/* ══════════════════════════
          HERO
         ══════════════════════════ */}
      <Section className="min-h-screen flex flex-col items-center justify-center pt-24 pb-16 noise">
        <MatrixRain />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/8 via-transparent to-transparent pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 glass-bright rounded-full mb-6 text-xs font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-cyan-300">GitHub App</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">One-click install</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Free forever</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.4 }}
              className="text-5xl lg:text-6xl xl:text-[4.2rem] font-bold leading-[1.1] tracking-tight mb-6"
            >
              Know what&apos;s hiding
              <br />
              <span className="gradient-text">in your dependencies.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-slate-400 text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl"
            >
              PkgSentry automatically scans every push for CVEs, abandoned packages, and
              supply chain threats — and posts an AI-powered fix report directly in your PR.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10"
            >
              <motion.a
                href="/signup"
                className="group relative px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all text-sm flex items-center gap-2 justify-center shadow-xl shadow-cyan-500/25 overflow-hidden"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Github className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Install GitHub App — Free</span>
              </motion.a>

              <motion.a
                href="/signup"
                className="px-6 py-3.5 glass-bright text-slate-300 hover:text-white font-medium rounded-xl transition-all text-sm flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Eye className="w-4 h-4" />
                View live demo
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.a>
            </motion.div>

            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {[
                { value: '2M', label: 'packages scanned' },
                { value: '47K', label: 'vulns detected' },
                { value: '1.2K', label: 'repos protected' },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">{value}</span>
                  <span className="text-sm text-slate-500">+{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Terminal + floating badges */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: easeOut, delay: 0.5 }}
            className="flex-1 relative w-full max-w-xl"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TerminalWindow />
            </motion.div>

            {/* Floating decorative badges */}
            <FloatingBadge
              className="glass-bright -left-8 top-16 shadow-xl hidden lg:flex"
              delay={0.5}
            >
              <div className="w-2 h-2 rounded-full bg-red-400 glow-red animate-pulse" />
              <span className="text-red-300 text-[11px]">1 Critical CVE found</span>
            </FloatingBadge>

            <FloatingBadge
              className="glass-bright -right-6 bottom-24 shadow-xl hidden lg:flex"
              delay={1.5}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 text-[11px]">PR report posted</span>
            </FloatingBadge>

            <FloatingBadge
              className="glass-bright right-4 top-8 shadow-xl hidden lg:flex"
              delay={1}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300 text-[11px]">AI fix ready</span>
            </FloatingBadge>

            {/* Glow under terminal */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-cyan-500/15 blur-2xl rounded-full pointer-events-none" />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-slate-600 text-xs font-mono">scroll to explore</span>
          <motion.div
            className="w-[1px] h-8 bg-gradient-to-b from-transparent via-cyan-500/60 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </Section>

      {/* ══════════════════════════
          MARQUEE STATS
         ══════════════════════════ */}
      <div className="border-y border-slate-800/60 bg-slate-950/50 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(4)
            .fill(null)
            .flatMap(() => [
              { icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />, text: '180,000+ CVEs tracked' },
              { icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />, text: '99.1% scan accuracy' },
              { icon: <GitBranch className="w-3.5 h-3.5 text-purple-400" />, text: 'npm · pip · Go · Cargo · Maven' },
              { icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, text: 'Scan in under 30 seconds' },
              { icon: <Bell className="w-3.5 h-3.5 text-orange-400" />, text: 'Zero-config setup' },
              { icon: <Star className="w-3.5 h-3.5 text-pink-400" />, text: 'Trusted by 1,200+ developers' },
              { icon: <Lock className="w-3.5 h-3.5 text-blue-400" />, text: 'License compliance checking' },
              { icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />, text: 'Full dependency tree analysis' },
            ])
            .map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 mx-8 text-sm text-slate-500 font-mono"
              >
                {item.icon}
                {item.text}
              </span>
            ))}
        </div>
      </div>

      {/* ══════════════════════════
          STATS
         ══════════════════════════ */}
      <Section className="py-24 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger(0.12)}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { value: 2147293, suffix: '+', label: 'Packages scanned', color: 'text-cyan-400' },
              { value: 47832, suffix: '+', label: 'CVEs detected', color: 'text-red-400' },
              { value: 1248, suffix: '+', label: 'Repos protected', color: 'text-emerald-400' },
              { value: 98.7, suffix: '%', label: 'Scan accuracy', color: 'text-purple-400', decimals: 1 },
            ].map(({ value, suffix, label, color, decimals }) => (
              <motion.div
                key={label}
                variants={scaleIn}
                className="glass rounded-2xl p-6 border border-slate-800/50 text-center group hover:border-slate-700/80 transition-colors"
              >
                <div className={`text-4xl font-bold ${color} mb-1`}>
                  <Counter target={value} suffix={suffix} decimals={decimals} />
                </div>
                <div className="text-slate-500 text-sm">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════
          PROBLEM
         ══════════════════════════ */}
      <Section className="py-28 bg-gradient-to-b from-transparent via-red-950/10 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-red-400/80 border border-red-500/20 bg-red-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                The Problem
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              You&apos;re one{' '}
              <span className="font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg text-3xl lg:text-4xl">
                npm install
              </span>{' '}
              away from a breach.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-2xl mx-auto">
              70%+ of modern codebases are open-source dependencies. A single compromised
              package can backdoor thousands of applications.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              {
                pkg: 'event-stream',
                version: '3.3.6',
                downloads: '~2M/week',
                desc: 'Malicious code injected to steal cryptocurrency wallets from Copay users. Discovered 5 weeks after publish.',
                severity: 'critical' as const,
                year: '2018',
              },
              {
                pkg: 'ua-parser-js',
                version: '0.7.28',
                downloads: '~8M/week',
                desc: 'Hijacked to install cryptominer and credential-stealing malware. Affected Facebook, Microsoft, and thousands of companies.',
                severity: 'critical' as const,
                year: '2021',
              },
              {
                pkg: 'colors.js',
                version: '1.4.1',
                downloads: '~23M/week',
                desc: 'Author intentionally broke their own package in protest, crashing builds for thousands of apps including AWS CDK.',
                severity: 'high' as const,
                year: '2022',
              },
            ].map(({ pkg, version, downloads, desc, severity, year }) => (
              <motion.div
                key={pkg}
                variants={scaleIn}
                className="group glass rounded-2xl p-6 border border-slate-800/50 hover:border-red-500/20 transition-all card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-white font-semibold text-sm">{pkg}</div>
                    <div className="font-mono text-slate-500 text-xs">{version}</div>
                  </div>
                  <SeverityBadge level={severity} />
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                  <span className="text-xs text-slate-600 font-mono">{downloads}</span>
                  <span className="text-xs text-slate-600 font-mono">{year}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center"
          >
            <p className="text-slate-500 text-sm">
              None of these attacks would have passed a PkgSentry scan.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════
          FEATURES
         ══════════════════════════ */}
      <Section id="features" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-cyan-400/80 border border-cyan-500/20 bg-cyan-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                Features
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Everything you need to{' '}
              <span className="gradient-text">ship safely.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">
              Full-stack dependency security — from first-party CVEs to abandoned maintainers
              and license compliance.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════
          HOW IT WORKS
         ══════════════════════════ */}
      <Section id="how-it-works" className="py-28 bg-slate-950/50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                How it works
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Up and running in{' '}
              <span className="text-emerald-400">60 seconds.</span>
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-[calc(16.666%-1px)] right-[calc(16.666%-1px)] h-[1px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: easeOut, delay: 0.4 }}
                className="h-full origin-left bg-gradient-to-r from-cyan-500/60 via-emerald-500/60 to-purple-500/60"
              />
            </div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger(0.2)}
              className="grid lg:grid-cols-3 gap-8"
            >
              {[
                {
                  step: '01',
                  icon: <Github className="w-7 h-7" />,
                  title: 'Install the GitHub App',
                  desc: 'One click. No config files, no YAML, no SSH keys. Select which repos to monitor.',
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10 border-cyan-500/20',
                },
                {
                  step: '02',
                  icon: <GitBranch className="w-7 h-7" />,
                  title: 'Push your code',
                  desc: 'Every push and pull request automatically triggers a full dependency security scan.',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  step: '03',
                  icon: <BarChart3 className="w-7 h-7" />,
                  title: 'Get your report',
                  desc: 'PkgSentry posts an AI-generated security report directly in your PR with ranked fixes.',
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10 border-purple-500/20',
                },
              ].map(({ step, icon, title, desc, color, bg }) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    className={`relative w-[72px] h-[72px] rounded-2xl ${bg} border flex items-center justify-center mb-6 ${color}`}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {icon}
                    <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-slate-600 bg-slate-900 border border-slate-800 rounded px-1">
                      {step}
                    </span>
                  </motion.div>
                  <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════
          LIVE DEMO TERMINAL
         ══════════════════════════ */}
      <Section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-purple-400/80 border border-purple-500/20 bg-purple-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                Live Demo
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Watch a real scan{' '}
              <span className="gradient-text">in action.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-base max-w-xl mx-auto">
              Scroll into view to trigger an actual PkgSentry scan simulation.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            <TerminalWindow />
          </motion.div>

          {/* Scan summary row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: 'Critical', count: 1, cls: 'badge-critical' },
              { label: 'High', count: 2, cls: 'badge-high' },
              { label: 'Medium', count: 3, cls: 'badge-medium' },
              { label: 'Abandoned', count: 1, cls: 'badge-low' },
            ].map(({ label, count, cls }) => (
              <div
                key={label}
                className={`${cls} rounded-xl px-4 py-3 flex items-center justify-between`}
              >
                <span className="text-xs font-mono opacity-70">{label}</span>
                <span className="text-xl font-bold">{count}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════
          ECOSYSTEMS
         ══════════════════════════ */}
      <Section className="py-20 border-y border-slate-800/40 bg-slate-950/30">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-500 text-sm mb-8 font-mono tracking-wide uppercase"
          >
            Supported ecosystems
          </motion.p>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.08)}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { name: 'npm', file: 'package.json', color: 'text-red-400' },
              { name: 'PyPI', file: 'requirements.txt', color: 'text-yellow-400' },
              { name: 'Go', file: 'go.mod', color: 'text-cyan-400' },
              { name: 'Cargo', file: 'Cargo.toml', color: 'text-orange-400' },
              { name: 'Maven', file: 'pom.xml', color: 'text-pink-400' },
            ].map(({ name, file, color }) => (
              <motion.div
                key={name}
                variants={scaleIn}
                className="glass rounded-xl px-5 py-3 border border-slate-800/50 hover:border-slate-700/80 transition-colors group card-hover"
              >
                <div className={`font-bold text-sm ${color} mb-0.5`}>{name}</div>
                <div className="font-mono text-slate-600 text-[11px] group-hover:text-slate-500 transition-colors">
                  {file}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════
          PRICING
         ══════════════════════════ */}
      <Section id="pricing" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-yellow-400/80 border border-yellow-500/20 bg-yellow-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                Pricing
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Simple, honest pricing.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-8">
              Start free. Upgrade when you need more.
            </motion.p>

            {/* Toggle */}
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-3 glass rounded-full px-2 py-2 border border-slate-800/60"
            >
              <button
                onClick={() => setBillingAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !billingAnnual
                    ? 'bg-white/10 text-white shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingAnnual
                    ? 'bg-white/10 text-white shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Annual
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full px-1.5 py-0.5 font-mono">
                  −20%
                </span>
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
            className="grid md:grid-cols-3 gap-6 items-stretch"
          >
            {/* Free */}
            <motion.div
              variants={scaleIn}
              className="glass rounded-2xl p-7 border border-slate-800/50 flex flex-col card-hover"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-6">
                <div className="text-slate-400 font-medium mb-1">Free</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <div className="text-slate-500 text-xs mt-1">Forever free</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '3 repositories',
                  '10 scans / month',
                  'npm + pip support',
                  'GitHub PR comments',
                  'Community support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <motion.a
                href="/signup"
                className="w-full py-3 glass-bright text-white font-semibold rounded-xl border border-slate-700/60 hover:border-slate-600 transition-colors text-sm text-center block"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get started free
              </motion.a>
            </motion.div>

            {/* Pro — highlighted */}
            <motion.div
              variants={scaleIn}
              className="relative rounded-2xl p-7 border border-cyan-500/30 flex flex-col shadow-2xl shadow-cyan-500/10"
              style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(2,8,23,0.9))' }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Top glow */}
              <div className="absolute -top-[1px] left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent" />

              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-mono font-bold text-cyan-900 bg-cyan-400 rounded-full px-2 py-0.5 tracking-wide">
                  POPULAR
                </span>
              </div>

              <div className="mb-6">
                <div className="text-cyan-400 font-medium mb-1">Pro</div>
                <div className="flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={prices.pro}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-5xl font-bold text-white"
                    >
                      ${prices.pro}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {billingAnnual ? `$${prices.pro * 12}/year, billed annually` : 'billed monthly'}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unlimited repositories',
                  'Unlimited scans',
                  'All 5 ecosystems',
                  'AI fix suggestions',
                  'Email alerts',
                  'Priority scanning',
                  'Slack notifications',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <motion.a
                href="/signup"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors text-sm shadow-lg shadow-cyan-500/20 text-center block"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Start Pro trial
              </motion.a>
            </motion.div>

            {/* Team */}
            <motion.div
              variants={scaleIn}
              className="glass rounded-2xl p-7 border border-slate-800/50 flex flex-col card-hover"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-6">
                <div className="text-purple-400 font-medium mb-1">Team</div>
                <div className="flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={prices.team}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-5xl font-bold text-white"
                    >
                      ${prices.team}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {billingAnnual ? `$${prices.team * 12}/year, billed annually` : 'billed monthly'}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Everything in Pro',
                  'Team dashboard',
                  'Shared scan history',
                  'SBOM generation',
                  'REST API access',
                  'SSO / SAML',
                  'SLA + priority support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <motion.a
                href="/signup"
                className="w-full py-3 glass-bright text-white font-semibold rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors text-sm text-center block"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Contact sales
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════
          CTA
         ══════════════════════════ */}
      <Section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Animated glow orbs */}
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="text-xs font-mono text-cyan-400/80 border border-cyan-500/20 bg-cyan-500/5 rounded-full px-3 py-1 tracking-widest uppercase">
                Get started
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-bold mb-6">
              Your dependencies are{' '}
              <span className="gradient-text">already talking.</span>
              <br />
              Are you listening?
            </motion.h2>

            <motion.p variants={fadeUp} className="text-slate-400 text-xl mb-10">
              Install PkgSentry in 60 seconds. Free forever.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                href="/signup"
                className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-2xl transition-all text-base flex items-center gap-2 justify-center shadow-2xl shadow-cyan-500/30 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Github className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Install GitHub App — Free</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                href="/login"
                className="px-8 py-4 glass-bright text-slate-300 hover:text-white font-medium rounded-2xl transition-all text-base flex items-center gap-2 justify-center border border-slate-700/60"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Code2 className="w-5 h-5" />
                Sign in
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.a>
            </motion.div>

            <motion.p
              variants={fadeIn}
              className="mt-6 text-slate-600 text-sm"
            >
              No credit card required · Works with public and private repos ·{' '}
              <span className="text-slate-500">SOC2 in progress</span>
            </motion.p>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════
          FOOTER
         ══════════════════════════ */}
      <footer className="border-t border-slate-800/50 bg-slate-950/60 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">Pkg</span>
                <span className="text-cyan-400">Sentry</span>
              </span>
              <span className="text-slate-600 text-sm ml-2">
                © {new Date().getFullYear()} Mohammad Abbas
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {['Features', 'Pricing', 'Docs', 'Blog', 'GitHub', 'Twitter'].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-500 text-xs font-mono">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
