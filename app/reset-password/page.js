'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, CheckCircle, XCircle } from 'lucide-react'

const LOGO_URL = '/grofience-logo.png'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'
  const [msg, setMsg] = useState('')

  useEffect(() => { if (!token) { setStatus('error'); setMsg('Invalid or missing reset link.') } }, [token])

  async function handleReset(e) {
    e.preventDefault()
    if (pw !== confirm) { setStatus('error'); setMsg('Passwords do not match.'); return }
    if (pw.length < 6) { setStatus('error'); setMsg('Password must be at least 6 characters.'); return }
    setLoading(true); setStatus(null)
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: pw }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      setStatus('success'); setMsg('Password reset successfully! Redirecting to login...')
      setTimeout(() => router.push('/'), 2500)
    } catch (e) { setStatus('error'); setMsg(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Grofience" className="h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Reset Password</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Enter your new password below</p>

          {status === 'success' && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 mb-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{msg}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{msg}</p>
            </div>
          )}

          {status !== 'success' && token && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input required type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input required type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-200">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secured with bcrypt encryption
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
