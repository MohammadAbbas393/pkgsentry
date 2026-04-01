'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function SettingsForm({ user, accentColor }: { user: User; accentColor: 'cyan' | 'violet' }) {
  const supabase = createClient()
  const [name, setName] = useState((user.user_metadata?.full_name as string) ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const accent = accentColor === 'cyan' ? 'bg-cyan-500 hover:bg-cyan-400 focus:border-cyan-500' : 'bg-violet-600 hover:bg-violet-500 focus:border-violet-500'
  const focusBorder = accentColor === 'cyan' ? 'focus:border-cyan-500' : 'focus:border-violet-500'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleChangePassword() {
    await supabase.auth.resetPasswordForEmail(user.email!, {
      redirectTo: `${location.origin}/auth/callback?next=/dashboard/settings`,
    })
    alert('Password reset email sent!')
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className={`w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors ${focusBorder}`} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input type="email" value={user.email} disabled
              className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-400 px-4 py-2.5 rounded-lg text-sm cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving}
            className={`flex items-center gap-2 ${accentColor === 'cyan' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900' : 'bg-violet-600 hover:bg-violet-500 text-white'} font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-1">Password</h2>
        <p className="text-slate-500 text-sm mb-4">We'll email you a reset link</p>
        <button onClick={handleChangePassword}
          className="border border-slate-700 text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Change password
        </button>
      </div>
    </div>
  )
}
