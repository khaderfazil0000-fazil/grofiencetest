'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react'

const LOGO_URL = '/grofience-logo.png'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error
  const [msg, setMsg] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('Invalid or missing verification link.'); return }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setName(data.name || '')
          setMsg('Your email has been verified successfully!')
        } else {
          setStatus('error')
          setMsg(data.error || 'Verification failed. The link may have expired.')
        }
      })
      .catch(() => { setStatus('error'); setMsg('Something went wrong. Please try again.') })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-blue-100">
          <img src={LOGO_URL} alt="Grofience" className="h-12 object-contain mx-auto mb-6" />

          {status === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Verifying your email...</h1>
              <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
              {/* Success icon with ring animation */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {name ? `Welcome, ${name}! 🎉` : 'Email Verified! 🎉'}
              </h1>
              <p className="text-gray-500 text-sm mb-6">{msg}</p>

              {/* What to do next */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 text-left">
                <p className="text-sm font-bold text-blue-900 mb-3">🚀 You're all set! Here's what to do next:</p>
                <div className="space-y-2">
                  {[
                    { icon: '📊', text: 'Track your first income or expense' },
                    { icon: '🎯', text: 'Set a savings goal' },
                    { icon: '👥', text: 'Join a community challenge' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-blue-800"
                    >
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-500 text-sm mb-2">{msg}</p>
              <p className="text-xs text-gray-400 mb-6">
                If the link expired, you can request a new one from the app settings.
              </p>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Back to App
              </button>
            </motion.div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">© {new Date().getFullYear()} Grofience · Grow · Finance · Confidence</p>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
