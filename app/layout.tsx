import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PkgSentry — AI-Powered Dependency Security Scanner',
  description:
    'Automatically scan your GitHub repositories for CVEs, abandoned packages, and supply chain threats. One-click GitHub App install. Reports on every push.',
  keywords:
    'dependency scanner, CVE, npm security, supply chain security, GitHub App, vulnerability scanner',
  openGraph: {
    title: "PkgSentry — Know what's hiding in your dependencies",
    description:
      'AI-powered dependency security scanning for GitHub repositories.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#020817] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
