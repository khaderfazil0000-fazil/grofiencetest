'use client'

import { useState, useEffect, useRef } from 'react'
import { UIIcon } from '@/components/UIIcon'
import { Users, LogOut, Search, Trash2, Download, RefreshCw, Shield, TrendingUp, UserCheck, Calendar, BookOpen, Plus, X, FileText, ExternalLink, Award, CheckCircle, MessageSquare, Send, ChevronLeft, Globe, Phone, Mail, Link, Edit3, Save, Headphones } from 'lucide-react'

const LOGO_URL = '/grofience-logo.png'

async function adminApi(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('grofience_admin_token') : null
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatDateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ---- LOGIN ----
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const data = await adminApi('admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('grofience_admin_token', data.token)
      onLogin(data.admin)
    } catch (err) { setError(err.message || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white rounded-2xl px-5 py-3 mb-4 shadow-lg">
              <img src={LOGO_URL} alt="Grofience" className="h-10 object-contain" />
            </div>
            <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 rounded-full px-4 py-1.5">
              <Shield size={14} className="text-blue-300" />
              <span className="text-blue-200 text-sm font-semibold tracking-wider">ADMIN PANEL</span>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Admin Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@grofience.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
            </div>
            {error && <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-300 text-sm text-center">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg mt-2">
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>
          <p className="text-center text-white/30 text-xs mt-6">This panel is for administrators only</p>
        </div>
      </div>
    </div>
  )
}

// ---- STUDENT DETAIL MODAL ----
function StudentDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      try { const d = await adminApi(`admin/users/${userId}`); setData(d) }
      catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [userId])

  // Close on backdrop click
  function handleBackdrop(e) { if (e.target === e.currentTarget) onClose() }

  const u = data?.user
  const a = data?.analytics

  // Avatar: use profile photo if available, else initial
  function AvatarDisplay({ size = 80 }) {
    if (u?.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('/'))) {
      return <img src={u.avatar} alt="Profile" className="rounded-full object-cover border-2 border-white/20" style={{ width: size, height: size }} />
    }
    const initials = ((u?.fullName || u?.username || '?').split(' ').map(w => w[0]).join('').slice(0, 2)).toUpperCase()
    return (
      <div className="rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black border-2 border-white/20 flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.35 }}>
        {initials}
      </div>
    )
  }

  function InfoRow({ label, value, mono, color, icon }) {
    return (
      <div className="flex items-start justify-between py-3 px-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <span className="text-slate-500 text-sm flex items-center gap-2 w-44 flex-shrink-0">{icon && <span>{icon}</span>}{label}</span>
        <span className={`text-sm text-right flex-1 break-all ${mono ? 'font-mono text-amber-400 text-xs' : color || 'text-slate-200 font-medium'}`}>
          {value || <span className="text-slate-600 italic text-xs">Not provided</span>}
        </span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleBackdrop}>
      <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-blue-400" /> Student Overview
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition bg-slate-800 hover:bg-slate-700 rounded-xl p-1.5">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="p-16 text-center">
              <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-slate-500 text-sm">Loading student details...</p>
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          )}
          {!loading && !error && u && a && (
            <>
              {/* Profile hero */}
              <div className="px-6 py-6 bg-gradient-to-b from-slate-800/60 to-transparent flex items-start gap-5 border-b border-white/5">
                <AvatarDisplay size={72} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white leading-tight">{u.fullName || u.username}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">@{u.username}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-0.5 text-xs font-bold">Lv {u.level || 1}</span>
                    <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full px-2.5 py-0.5 text-xs font-bold">{u.xp || 0} XP</span>
                    {u.emailVerified
                      ? <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"><CheckCircle size={10}/>Verified</span>
                      : <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Unverified</span>
                    }
                  </div>
                </div>
              </div>

              {/* Finance stats row */}
              <div className="grid grid-cols-3 gap-0 border-b border-white/5">
                <div className="flex flex-col items-center py-4 border-r border-white/5">
                  <span className="text-xs text-slate-500 mb-1">💰 Income</span>
                  <span className="text-lg font-black text-emerald-400">₹{(a.totalIncome || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center py-4 border-r border-white/5">
                  <span className="text-xs text-slate-500 mb-1">📉 Expenses</span>
                  <span className="text-lg font-black text-red-400">₹{(a.totalExpense || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="text-xs text-slate-500 mb-1">🎯 Goals Achieved</span>
                  <span className="text-lg font-black text-amber-400">{a.goalsAchieved}/{a.totalGoals || 0}</span>
                </div>
              </div>

              {/* Detail rows */}
              <div className="divide-y divide-transparent">
                <div className="px-5 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-800/30">Profile Information</div>
                <InfoRow icon="👤" label="Full Name" value={u.fullName} />
                <InfoRow icon="🔖" label="Username" value={`@${u.username}`} />
                <InfoRow icon="📧" label="Email" value={u.email} />
                <InfoRow icon="📞" label="Phone Number" value={u.phone} />
                <InfoRow icon="🎂" label="Date of Birth / Age" value={u.age ? `${u.age} years` : null} />
                <InfoRow icon="👨‍👩‍👦" label="Parent Name / Contact" value={u.parentName || u.parentEmail} />

                <div className="px-5 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-800/30">Account Details</div>
                <InfoRow icon="🏆" label="Certificate Code" value={u.certCode} mono />
                <InfoRow icon="📅" label="Joined Date" value={formatDate(u.createdAt)} />
                <InfoRow icon="🕐" label="Last Login" value={u.lastLoginAt ? formatDate(u.lastLoginAt) : null} />
                <InfoRow icon="⚡" label="Level / XP" value={`Level ${u.level || 1} · ${u.xp || 0} XP`} />
                <InfoRow icon="🔥" label="Streak" value={u.streak ? `${u.streak} days` : null} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {u && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-slate-600 font-mono truncate max-w-[60%]">ID: {u.id}</p>
            <button onClick={onClose} className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl transition">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- STUDENTS VIEW ----
function StudentsView() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)

  async function fetchStats() {
    setLoading(true); setError('')
    try { const data = await adminApi('admin/stats'); setStats(data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchStats() }, [])

  async function deleteUser(userId, name) {
    if (!confirm(`Delete student "${name}"? This will also remove all their data.`)) return
    setDeleting(userId)
    try { await adminApi(`admin/users/${userId}`, { method: 'DELETE' }); await fetchStats() }
    catch (err) { alert('Failed: ' + err.message) }
    finally { setDeleting(null) }
  }

  function exportCSV() {
    if (!stats?.users) return
    const headers = ['Full Name','Username','Email','Phone','Age','Level','XP','Joined','Last Login']
    const rows = stats.users.map(u => [u.fullName||u.username,u.username,u.email,u.phone||'',u.age||'',u.level||1,u.xp||0,u.createdAt?new Date(u.createdAt).toLocaleDateString():'',u.lastLoginAt?new Date(u.lastLoginAt).toLocaleDateString():''])
    const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='grofience_students.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = (stats?.users||[]).filter(u => {
    const q = search.toLowerCase()
    return !q||(u.fullName||'').toLowerCase().includes(q)||(u.username||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)||(u.phone||'').includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Student detail modal */}
      {selectedUserId && <StudentDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Student Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Manage all registered students on Grofience</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="bg-blue-500/20 rounded-xl p-2"><Users size={18} className="text-blue-400"/></div><span className="text-slate-400 text-sm">Total Students</span></div>
          <p className="text-4xl font-bold text-white">{loading?'—':stats?.totalUsers??0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border border-emerald-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="bg-emerald-500/20 rounded-xl p-2"><UserCheck size={18} className="text-emerald-400"/></div><span className="text-slate-400 text-sm">Joined Today</span></div>
          <p className="text-4xl font-bold text-white">{loading?'—':stats?.newToday??0}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="bg-violet-500/20 rounded-xl p-2"><TrendingUp size={18} className="text-violet-400"/></div><span className="text-slate-400 text-sm">This Week</span></div>
          <p className="text-4xl font-bold text-white">{loading?'—':stats?.newThisWeek??0}</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/10">
          <h2 className="font-semibold text-white flex items-center gap-2"><Users size={16} className="text-blue-400"/>All Students{stats&&<span className="bg-blue-600/30 text-blue-300 text-xs px-2 py-0.5 rounded-full ml-1">{filtered.length}</span>}</h2>
          <div className="flex items-center gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"/>
            </div>
            <button onClick={fetchStats} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 transition" title="Refresh">
              <RefreshCw size={14} className={`text-slate-400 ${loading?'animate-spin':''}`}/>
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-xl px-3 py-2 text-sm font-medium transition">
              <Download size={14}/><span className="hidden sm:block">Export</span>
            </button>
          </div>
        </div>
        {error && <div className="p-6 text-center text-red-400">{error}</div>}
        {loading && !error && <div className="p-12 text-center"><div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"/><p className="text-slate-500 text-sm">Loading...</p></div>}
        {!loading && !error && (
          <>
            {filtered.length===0?(
              <div className="p-12 text-center"><Users size={40} className="text-slate-700 mx-auto mb-3"/><p className="text-slate-500">{search?'No match.':'No students yet.'}</p></div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-slate-500 uppercase text-xs tracking-wider">
                    <th className="text-left px-4 py-3">#</th><th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Level</th><th className="text-left px-4 py-3">Joined</th>
                    <th className="text-left px-4 py-3">Last Login</th><th className="text-left px-4 py-3">Action</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((u,i)=>(
                      <tr key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className="border-b border-white/5 hover:bg-blue-600/5 transition-colors cursor-pointer group">
                        <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{i+1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {u.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('/'))
                              ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"/>
                              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(u.fullName||u.username||'?')[0].toUpperCase()}</div>
                            }
                            <div><div className="font-medium text-white group-hover:text-blue-300 transition-colors">{u.fullName||u.username}</div><div className="text-slate-500 text-xs">@{u.username}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">{u.email}</td>
                        <td className="px-4 py-3.5 text-slate-300">{u.phone||<span className="text-slate-600 italic text-xs">Not provided</span>}</td>
                        <td className="px-4 py-3.5"><span className="bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold">Lv {u.level||1}</span></td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs"><div className="flex items-center gap-1.5"><Calendar size={11} className="text-slate-600"/>{formatDateShort(u.createdAt)}</div></td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs">{u.lastLoginAt?<div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>{formatDate(u.lastLoginAt)}</div>:<span className="text-slate-600">—</span>}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedUserId(u.id)}
                              className="bg-blue-600/10 hover:bg-blue-600/30 border border-blue-500/20 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-lg p-1.5 transition-all" title="View Details">
                              <ExternalLink size={13}/>
                            </button>
                            <button onClick={()=>deleteUser(u.id,u.fullName||u.username)} disabled={deleting===u.id}
                              className="bg-red-600/10 hover:bg-red-600/30 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg p-1.5 transition-all disabled:opacity-50">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


// ---- BOOKS VIEW ----
const EMOJIS = ['📚','📖','📝','💡','🎯','🚀','💰','📊','🏆','🌟','🧠','💎']
function BooksView() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', pdfUrl:'', author:'', coverEmoji:'📚' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function fetchBooks() {
    setLoading(true)
    try { const d = await adminApi('admin/books'); setBooks(d.books||[]) }
    catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ fetchBooks() },[])

  async function addBook(e) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      await adminApi('admin/books',{ method:'POST', body: JSON.stringify(form) })
      setSuccess('Book added! It will now appear in the frontend E-Book section.')
      setForm({ title:'', description:'', pdfUrl:'', author:'', coverEmoji:'📚' })
      setShowForm(false)
      fetchBooks()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function deleteBook(id, title) {
    if (!confirm(`Remove "${title}" from the library?`)) return
    setDeleting(id)
    try { await adminApi(`admin/books/${id}`,{ method:'DELETE' }); fetchBooks() }
    catch(e) { alert('Failed: '+e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📚 Book Library</h1>
          <p className="text-slate-400 text-sm mt-1">Add PDF books here — they appear instantly in the student E-Book section</p>
        </div>
        <button onClick={()=>{setShowForm(!showForm);setError('');setSuccess('')}}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all">
          {showForm?<X size={16}/>:<Plus size={16}/>}{showForm?'Cancel':'Add Book'}
        </button>
      </div>

      {success && <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-4 py-3 text-emerald-300 text-sm">✅ {success}</div>}
      {error && <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">❌ {error}</div>}

      {/* Add Book Form */}
      {showForm && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Plus size={18} className="text-blue-400"/>Add New Book</h2>
          <form onSubmit={addBook} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Book Title *</label>
                <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Rich Dad Poor Dad for Teens"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Author</label>
                <input value={form.author} onChange={e=>setForm({...form,author:e.target.value})} placeholder="Grofience Team"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">PDF URL * <span className="text-slate-500 font-normal">(Google Drive / Dropbox / any direct link)</span></label>
              <input required value={form.pdfUrl} onChange={e=>setForm({...form,pdfUrl:e.target.value})} placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="A short summary of what this book covers..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none" rows={3}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Cover Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(em=>(
                  <button type="button" key={em} onClick={()=>setForm({...form,coverEmoji:em})}
                    className={`text-2xl p-2 rounded-lg transition-all ${form.coverEmoji===em?'bg-blue-600 ring-2 ring-blue-400':'bg-slate-800 hover:bg-slate-700'}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">
                {saving?'Saving...':'📚 Publish Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="p-12 text-center"><div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"/><p className="text-slate-500 text-sm">Loading books...</p></div>
      ) : books.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-16 text-center">
          <BookOpen size={48} className="text-slate-700 mx-auto mb-4"/>
          <p className="text-slate-400 font-medium">No books added yet</p>
          <p className="text-slate-600 text-sm mt-1">Click "Add Book" above to publish your first PDF</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book=>(
            <div key={book.id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="text-5xl">{book.coverEmoji}</div>
                <button onClick={()=>deleteBook(book.id,book.title)} disabled={deleting===book.id}
                  className="flex items-center gap-1.5 bg-red-600/15 hover:bg-red-600/35 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0">
                  <Trash2 size={12}/>{deleting===book.id ? 'Removing...' : 'Delete'}
                </button>
              </div>
              <h3 className="font-bold text-white text-base leading-snug mb-1">{book.title}</h3>
              <p className="text-xs text-slate-500 mb-1">by {book.author||'Grofience Team'}</p>
              {book.description && <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">{book.description}</p>}
              <div className="flex items-center gap-2 mt-4">
                <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  <ExternalLink size={12}/> Preview PDF
                </a>
                <span className="text-slate-700">·</span>
                <p className="text-xs text-slate-600">{formatDateShort(book.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-slate-700 text-xs text-center">Books published here appear instantly in the student E-Book section</p>
    </div>
  )
}

// ---- CERT SEARCH VIEW ----
function CertSearchView() {
  const [certId, setCertId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')

  async function search(e) {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null); setTab('overview')
    try {
      const data = await adminApi(`admin/certificate-search?certId=${encodeURIComponent(certId.trim())}`)
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const u = result?.user
  const a = result?.analytics
  const txs = result?.transactions || []
  const goals = result?.goals || []
  const tier = a ? (a.score >= 80 ? { name: 'Gold Achiever', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40', emoji: '🥇' }
    : a.score >= 50 ? { name: 'Silver Achiever', color: 'text-slate-300', bg: 'bg-slate-500/20 border-slate-500/40', emoji: '🥈' }
    : { name: 'Bronze Starter', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40', emoji: '🥉' }) : null

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'transactions', label: `💳 Transactions (${txs.length})` },
    { id: 'goals', label: `🎯 Goals (${goals.length})` },
    { id: 'profile', label: '👤 Profile' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Award className="text-amber-400" size={26}/>Certificate Lookup</h1>
        <p className="text-slate-400 text-sm mt-1">Search a student's certificate ID to view their full profile and achievements</p>
      </div>

      {/* Search */}
      <form onSubmit={search} className="flex gap-3">
        <div className="flex-1 relative">
          <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={certId} onChange={e => setCertId(e.target.value.toUpperCase())}
            placeholder="GRO-XXXXXXXX-2026"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-sm tracking-widest"/>
        </div>
        <button type="submit" disabled={loading || !certId.trim()}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl transition-all">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-500">
        💡 Format: <span className="font-mono text-slate-300">GRO-XXXXXXXX-YYYY</span> — found on the student's downloaded certificate PDF
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-4 text-red-300 text-sm flex items-center gap-2"><X size={16}/>{error}</div>}

      {/* Full Result */}
      {result && u && a && (
        <div className="space-y-4">
          {/* Hero card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-black text-white flex-shrink-0">
                {(u.fullName || u.username || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-2xl font-bold text-white">{u.fullName || u.username}</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.color}`}>{tier.emoji} {tier.name}</span>
                  {u.emailVerified && <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"><CheckCircle size={11}/>Verified</span>}
                </div>
                <p className="text-slate-400 text-sm">@{u.username}</p>
                <p className="text-slate-500 text-sm">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                <p className="text-slate-600 text-xs mt-1 font-mono">Cert: {certId.toUpperCase()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-5xl font-black text-white">{a.score}</div>
                <div className="text-xs text-slate-500">Finance Score</div>
                <div className="text-sm font-semibold text-violet-400 mt-1">Lv {u.level || 1} · {u.xp || 0} XP</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>{a.score}/100</span></div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all" style={{ width: `${a.score}%` }}/>
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Income', value: `₹${a.totalIncome.toLocaleString()}`, color: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-400', icon: '/icons/4.png' },
              { label: 'Total Expense', value: `₹${a.totalExpense.toLocaleString()}`, color: 'border-red-500/30 bg-red-500/10', text: 'text-red-400', icon: '📉' },
              { label: 'Total Saved', value: `₹${a.totalSaved.toLocaleString()}`, color: 'border-blue-500/30 bg-blue-500/10', text: 'text-blue-400', icon: '/icons/3.png' },
              { label: 'Savings Rate', value: `${a.savingsRate.toFixed(1)}%`, color: 'border-violet-500/30 bg-violet-500/10', text: 'text-violet-400', icon: '/icons/38.png' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border px-4 py-4 ${s.color}`}>
                <div className="w-6 h-6 mb-1 mx-auto"><UIIcon icon={s.icon} className="w-full h-full object-contain" /></div>
                <div className={`text-xl font-bold ${s.text}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-900 border border-white/10 p-1 rounded-xl flex-wrap">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all min-w-fit ${tab === t.id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Activity</div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Transactions</span><span className="text-white font-bold">{a.txCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Total Goals</span><span className="text-white font-bold">{a.goalCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Goals Completed</span><span className="text-emerald-400 font-bold">{a.completedGoals}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Goals Pending</span><span className="text-amber-400 font-bold">{a.goalCount - a.completedGoals}</span></div>
                </div>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Account</div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Level</span><span className="text-violet-400 font-bold">Lv {u.level || 1}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">XP</span><span className="text-white font-bold">{u.xp || 0}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Age</span><span className="text-white font-bold">{u.age || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Email Verified</span><span className={u.emailVerified ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{u.emailVerified ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Badges {u.badges?.length ? `(${u.badges.length})` : ''}</div>
                {u.badges?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {u.badges.map(b => <span key={b} className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold px-2 py-1 rounded-full">🏅 {b}</span>)}
                  </div>
                ) : <p className="text-slate-600 text-sm">No badges yet</p>}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {tab === 'transactions' && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              {txs.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No transactions recorded yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3">#</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">Source / Note</th>
                      <th className="text-right px-4 py-3">Amount</th>
                    </tr></thead>
                    <tbody>
                      {txs.map((t, i) => (
                        <tr key={t.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{i + 1}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{t.date ? new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {t.type === 'income' ? '↑ Income' : '↓ Expense'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{t.source || t.note || <span className="text-slate-600 italic text-xs">—</span>}</td>
                          <td className={`px-4 py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.type === 'income' ? '+' : '-'}₹{(t.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10 bg-slate-800/50">
                        <td colSpan={4} className="px-4 py-3 text-slate-400 text-sm font-semibold">Net Balance</td>
                        <td className={`px-4 py-3 text-right font-black ${a.totalSaved >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>₹{a.totalSaved.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* GOALS TAB */}
          {tab === 'goals' && (
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center text-slate-500">No goals set yet</div>
              ) : goals.map((g, i) => {
                const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0
                const done = g.target > 0 && g.saved >= g.target
                return (
                  <div key={g.id || i} className="bg-slate-900 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{g.emoji || '🎯'}</span>
                        <span className="font-semibold text-white">{g.title}</span>
                        {done && <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full font-bold">✓ Done</span>}
                      </div>
                      <span className="text-sm font-bold text-slate-300">₹{(g.saved||0).toLocaleString()} / ₹{(g.target||0).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}/>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>{pct.toFixed(0)}% complete</span>
                      {g.deadline && <span>Deadline: {new Date(g.deadline).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 text-sm font-semibold text-slate-400 uppercase tracking-wider">Full Student Details</div>
              <div className="divide-y divide-white/5">
                {[
                  { label: 'Full Name', value: u.fullName },
                  { label: 'Username', value: `@${u.username}` },
                  { label: 'Email', value: u.email },
                  { label: 'Phone', value: u.phone || '—' },
                  { label: 'Age', value: u.age || '—' },
                  { label: 'Parent Email', value: u.parentEmail || '—' },
                  { label: 'Email Verified', value: u.emailVerified ? '✅ Yes' : '❌ No' },
                  { label: 'Level', value: `Level ${u.level || 1}` },
                  { label: 'XP Points', value: `${u.xp || 0} XP` },
                  { label: 'User ID', value: u.id, mono: true },
                  { label: 'Certificate ID', value: certId.toUpperCase(), mono: true },
                  { label: 'Joined', value: formatDate(u.createdAt) },
                  { label: 'Last Login', value: formatDate(u.lastLoginAt) },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between px-6 py-3 hover:bg-white/3 transition-colors">
                    <span className="text-slate-500 text-sm w-40 flex-shrink-0">{row.label}</span>
                    <span className={`text-sm text-right flex-1 ${row.mono ? 'font-mono text-amber-400 text-xs' : 'text-slate-200 font-medium'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-slate-700 text-xs text-center">Joined: {formatDateShort(u.createdAt)} · Last Login: {formatDate(u.lastLoginAt)}</p>
        </div>
      )}
    </div>
  )
}

// ---- MESSAGES VIEW ----
function MessagesView() {
  const [conversations, setConversations] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [messages, setMessages] = useState([])
  const [student, setStudent] = useState(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [totalUnread, setTotalUnread] = useState(0)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)

  async function fetchConversations() {
    try {
      const data = await adminApi('admin/messages')
      setConversations(data.conversations || [])
      setTotalUnread((data.conversations || []).reduce((s, c) => s + (c.unread || 0), 0))
    } catch (e) { setError(e.message) }
    finally { setLoadingConvs(false) }
  }

  async function fetchThread(studentId) {
    setLoadingMsgs(true)
    try {
      const data = await adminApi(`admin/messages/${studentId}`)
      setMessages(data.messages || [])
      setStudent(data.student)
      // refresh convs to clear badge
      fetchConversations()
    } catch (e) { setError(e.message) }
    finally { setLoadingMsgs(false) }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || !selectedStudent) return
    setSending(true)
    try {
      const data = await adminApi(`admin/messages/${selectedStudent}`, { method: 'POST', body: JSON.stringify({ text }) })
      setMessages(prev => [...prev, data.message])
      setText('')
    } catch (e) { setError(e.message) }
    finally { setSending(false) }
  }

  useEffect(() => { fetchConversations() }, [])

  // Auto-refresh every 8 seconds
  useEffect(() => {
    const t = setInterval(() => {
      fetchConversations()
      if (selectedStudent) fetchThread(selectedStudent)
    }, 8000)
    return () => clearInterval(t)
  }, [selectedStudent])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedStudent) fetchThread(selectedStudent)
  }, [selectedStudent])

  function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  const filteredConvs = conversations.filter(c =>
    !search || c.studentName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 bg-slate-950 rounded-2xl overflow-hidden border border-white/10">

      {/* Left panel — conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col bg-slate-900">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" />
              Support Inbox
              {totalUnread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{totalUnread}</span>}
            </h2>
            <button onClick={fetchConversations} className="text-slate-500 hover:text-slate-300 transition">
              <RefreshCw size={14} className={loadingConvs ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs && conversations.length === 0 ? (
            <div className="p-8 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">{search ? 'No match' : 'No conversations yet'}</p>
              <p className="text-slate-600 text-xs mt-1">Send a message to a student to start</p>
            </div>
          ) : filteredConvs.map(conv => (
            <button key={conv.studentId} onClick={() => setSelectedStudent(conv.studentId)}
              className={`w-full text-left px-4 py-3.5 border-b border-white/5 hover:bg-slate-800 transition-colors ${
                selectedStudent === conv.studentId ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : ''
              }`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(conv.studentName || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${conv.unread > 0 ? 'text-white' : 'text-slate-300'}`}>{conv.studentName}</span>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">{formatTime(conv.lastAt)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">{conv.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — chat window */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedStudent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <MessageSquare size={36} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Support Messages</h3>
            <p className="text-slate-500 text-sm max-w-xs">Select a conversation from the left, or send a message to a student from the Students tab.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-white/10 bg-slate-900 flex items-center gap-3">
              <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-white transition lg:hidden">
                <ChevronLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                {(student?.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{student?.name || 'Loading...'}</div>
                <div className="text-xs text-slate-500">{student?.email}</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-500">Live Support</span>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600 text-sm">No messages yet. Say hello! 👋</p>
                </div>
              ) : messages.map(msg => {
                const isAdmin = msg.senderRole === 'admin'
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    {!isAdmin && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end mb-0.5">
                        {(msg.senderName || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isAdmin ? 'order-1' : ''}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`text-[10px] text-slate-600 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.createdAt)}
                        {isAdmin && msg.readByStudent && <span className="ml-1 text-blue-400">✓ Seen</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-5 py-4 border-t border-white/10 bg-slate-900">
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <div className="flex items-end gap-3">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                />
                <button type="submit" disabled={!text.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ---- COMMUNITY & SUPPORT VIEW (TEEN COMMUNITY MANAGER) ----
function CommunityView() {
  const [subTab, setSubTab] = useState('whatsapp')
  // WhatsApp
  const [waLink, setWaLink] = useState('')
  const [inputLink, setInputLink] = useState('')
  const [editingWa, setEditingWa] = useState(false)
  const [savingWa, setSavingWa] = useState(false)
  const [loadingWa, setLoadingWa] = useState(true)
  // Header stats & symbol
  const [headerForm, setHeaderForm] = useState({ members: '2.4k', postsToday: 148, liveChallenges: 4, symbol: '🚀' })
  const [savingHeader, setSavingHeader] = useState(false)
  const [loadingHeader, setLoadingHeader] = useState(true)
  // Finance tips
  const [tips, setTips] = useState([])
  const [loadingTips, setLoadingTips] = useState(true)
  const [editingTipIdx, setEditingTipIdx] = useState(null)
  const [savingTips, setSavingTips] = useState(false)
  const [showTipForm, setShowTipForm] = useState(false)
  const [tipForm, setTipForm] = useState({ icon: '💡', title: '', desc: '' })
  // Challenges
  const [challenges, setChallenges] = useState([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [savingChallenges, setSavingChallenges] = useState(false)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challengeForm, setChallengeForm] = useState({ emoji: '🎯', title: '', desc: '', xp: 50, participants: 0 })
  const [editingChallengeIdx, setEditingChallengeIdx] = useState(null)
  // Resources
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [savingResources, setSavingResources] = useState(false)
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'Article', url: '', mins: 5 })
  const [editingResourceIdx, setEditingResourceIdx] = useState(null)
  // Posts
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [deletingPost, setDeletingPost] = useState(null)
  // Flagged Posts (reports)
  const [flaggedPosts, setFlaggedPosts] = useState([])
  const [loadingFlags, setLoadingFlags] = useState(true)
  const [actioningFlag, setActioningFlag] = useState(null)
  // Global feedback
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  function showFeedback(msg, isError = false) {
    if (isError) { setError(msg); setSuccess('') } else { setSuccess(msg); setError('') }
    setTimeout(() => { setSuccess(''); setError('') }, 3000)
  }
  async function fetchWaLink() {
    setLoadingWa(true)
    try { const d = await adminApi('admin/community'); setWaLink(d.whatsappLink || ''); setInputLink(d.whatsappLink || '') }
    catch (e) { showFeedback(e.message, true) } finally { setLoadingWa(false) }
  }
  async function saveWaLink(e) {
    e.preventDefault(); setSavingWa(true)
    try { await adminApi('admin/community', { method: 'POST', body: JSON.stringify({ whatsappLink: inputLink.trim() }) }); setWaLink(inputLink.trim()); setEditingWa(false); showFeedback('WhatsApp link updated!') }
    catch (e) { showFeedback(e.message, true) } finally { setSavingWa(false) }
  }
  async function fetchHeader() {
    setLoadingHeader(true)
    try { const d = await adminApi('admin/community/header'); setHeaderForm(d) }
    catch {} finally { setLoadingHeader(false) }
  }
  async function saveHeader(e) {
    e.preventDefault(); setSavingHeader(true)
    try { await adminApi('admin/community/header', { method: 'POST', body: JSON.stringify(headerForm) }); showFeedback('Header stats updated!') }
    catch (e) { showFeedback(e.message, true) } finally { setSavingHeader(false) }
  }
  async function fetchTips() {
    setLoadingTips(true)
    try { const d = await adminApi('admin/community/tips'); setTips(d.tips || []) }
    catch {} finally { setLoadingTips(false) }
  }
  async function saveTips(newTips) {
    setSavingTips(true)
    try { await adminApi('admin/community/tips', { method: 'POST', body: JSON.stringify({ tips: newTips }) }); setTips(newTips); showFeedback('Finance tips updated!') }
    catch (e) { showFeedback(e.message, true) } finally { setSavingTips(false) }
  }
  function addTip() { if (!tipForm.title.trim()) return; saveTips([...tips, { ...tipForm }]); setTipForm({ icon: '💡', title: '', desc: '' }); setShowTipForm(false) }
  function deleteTip(idx) { if (!confirm('Remove this tip?')) return; saveTips(tips.filter((_, i) => i !== idx)) }
  function updateTip(idx, f, v) { setTips(tips.map((t, i) => i === idx ? { ...t, [f]: v } : t)) }
  function saveEditedTip(idx) { saveTips([...tips]); setEditingTipIdx(null) }
  async function fetchChallenges() {
    setLoadingChallenges(true)
    try { const d = await adminApi('admin/community/challenges'); setChallenges(d.challenges || []) }
    catch {} finally { setLoadingChallenges(false) }
  }
  async function saveChallenges(newC) {
    setSavingChallenges(true)
    try { await adminApi('admin/community/challenges', { method: 'POST', body: JSON.stringify({ challenges: newC }) }); setChallenges(newC); showFeedback('Challenges updated!') }
    catch (e) { showFeedback(e.message, true) } finally { setSavingChallenges(false) }
  }
  function addChallenge() {
    if (!challengeForm.title.trim()) return
    saveChallenges([...challenges, { ...challengeForm, xp: Number(challengeForm.xp), participants: Number(challengeForm.participants) }])
    setChallengeForm({ emoji: '🎯', title: '', desc: '', xp: 50, participants: 0 }); setShowChallengeForm(false)
  }
  function deleteChallenge(idx) { if (!confirm('Remove this challenge?')) return; saveChallenges(challenges.filter((_, i) => i !== idx)) }
  function updateChallenge(idx, f, v) { setChallenges(challenges.map((c, i) => i === idx ? { ...c, [f]: v } : c)) }
  function saveEditedChallenge(idx) { saveChallenges([...challenges]); setEditingChallengeIdx(null) }
  async function fetchResources() {
    setLoadingResources(true)
    try { const d = await adminApi('admin/community/resources'); setResources(d.resources || []) }
    catch {} finally { setLoadingResources(false) }
  }
  async function saveResources(newR) {
    setSavingResources(true)
    try { await adminApi('admin/community/resources', { method: 'POST', body: JSON.stringify({ resources: newR }) }); setResources(newR); showFeedback('Learning resources updated!') }
    catch (e) { showFeedback(e.message, true) } finally { setSavingResources(false) }
  }
  function addResource() {
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) return
    saveResources([...resources, { ...resourceForm, mins: Number(resourceForm.mins) }])
    setResourceForm({ title: '', type: 'Article', url: '', mins: 5 }); setShowResourceForm(false)
  }
  function deleteResource(idx) { if (!confirm('Remove this resource?')) return; saveResources(resources.filter((_, i) => i !== idx)) }
  function updateResource(idx, f, v) { setResources(resources.map((r, i) => i === idx ? { ...r, [f]: v } : r)) }
  function saveEditedResource(idx) { saveResources([...resources]); setEditingResourceIdx(null) }
  async function fetchPosts() {
    setLoadingPosts(true)
    try { const d = await adminApi('admin/community/posts'); setPosts(d.posts || []) }
    catch {} finally { setLoadingPosts(false) }
  }
  async function deletePost(postId) {
    if (!confirm('Delete this post? This cannot be undone.')) return; setDeletingPost(postId)
    try {
      await adminApi(`admin/community/posts/${postId}`, { method: 'DELETE' })
      setPosts(posts.filter(p => p.id !== postId))
      // Also remove from flagged list
      setFlaggedPosts(prev => prev.filter(fp => fp.postId !== postId))
      showFeedback('Post deleted and all its reports cleared')
    }
    catch (e) { showFeedback(e.message, true) } finally { setDeletingPost(null) }
  }
  async function fetchFlaggedPosts() {
    setLoadingFlags(true)
    try { const d = await adminApi('admin/community/reports'); setFlaggedPosts(d.flaggedPosts || []) }
    catch {} finally { setLoadingFlags(false) }
  }
  async function dismissAllReports(postId) {
    setActioningFlag(postId + '_dismiss')
    try {
      await adminApi(`admin/community/posts/${postId}/reports`, { method: 'DELETE' })
      setFlaggedPosts(prev => prev.filter(fp => fp.postId !== postId))
      showFeedback('All reports dismissed — post remains visible')
    } catch (e) { showFeedback(e.message, true) } finally { setActioningFlag(null) }
  }
  async function deleteFlaggedPost(postId) {
    if (!confirm('Delete this post and all its reports?')) return
    setActioningFlag(postId + '_delete')
    try {
      await adminApi(`admin/community/posts/${postId}`, { method: 'DELETE' })
      setFlaggedPosts(prev => prev.filter(fp => fp.postId !== postId))
      setPosts(prev => prev.filter(p => p.id !== postId))
      showFeedback('Post deleted and all reports cleared')
    } catch (e) { showFeedback(e.message, true) } finally { setActioningFlag(null) }
  }
  useEffect(() => { fetchWaLink(); fetchHeader(); fetchTips(); fetchChallenges(); fetchResources(); fetchPosts(); fetchFlaggedPosts() }, [])

  const subTabs = [
    { id: 'whatsapp', label: 'WhatsApp Link', icon: Globe },
    { id: 'header', label: 'Header Stats', icon: TrendingUp },
    { id: 'tips', label: 'Finance Tips', icon: BookOpen },
    { id: 'challenges', label: 'Challenges', icon: Award },
    { id: 'resources', label: 'Resources', icon: ExternalLink },
    { id: 'posts', label: 'Community Posts', icon: Users },
    { id: 'flags', label: `Flagged Posts${flaggedPosts.length > 0 ? ` (${flaggedPosts.length})` : ''}`, icon: Shield },
  ]
  const ic = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe size={24} className="text-emerald-400" />Teen Community Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Edit all content displayed in the student Teen Community section.</p>
      </div>

      {success && <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-4 py-3 text-emerald-300 text-sm flex items-center gap-2">✅ {success}</div>}
      {error && <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">❌ {error}</div>}


      {/* Sub-tab navigation */}
      <div className="flex flex-wrap gap-1 bg-slate-900 border border-white/10 p-1.5 rounded-2xl">
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${subTab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {/* WhatsApp Link */}
      {subTab === 'whatsapp' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-600/20 to-slate-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"><span className="text-2xl">💬</span></div>
            <div><h2 className="text-white font-bold text-base">WhatsApp Community Link</h2><p className="text-slate-400 text-xs">Shown to all students on their dashboard</p></div>
            <button onClick={() => { setEditingWa(!editingWa); setInputLink(waLink) }}
              className="ml-auto flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all">
              <Edit3 size={14} />{editingWa ? 'Cancel' : 'Edit Link'}
            </button>
          </div>
          <div className="p-6">
            {loadingWa ? <div className="flex items-center gap-3 text-slate-500"><div className="w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin" /><span className="text-sm">Loading...</span></div>
            : editingWa ? (
              <form onSubmit={saveWaLink} className="flex gap-3">
                <div className="relative flex-1"><Link size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="url" value={inputLink} onChange={e => setInputLink(e.target.value)} placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" /></div>
                <button type="submit" disabled={savingWa} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl text-sm">
                  <Save size={15} />{savingWa ? 'Saving...' : 'Save'}
                </button>
              </form>
            ) : waLink ? (
              <div className="flex-1 bg-slate-800 border border-emerald-500/30 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Current Link</p>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 truncate">
                  <ExternalLink size={14} className="flex-shrink-0" /><span className="truncate">{waLink}</span></a>
              </div>
            ) : <p className="text-slate-500 text-sm">No link set yet. Click "Edit Link" to add one.</p>}
          </div>
        </div>
      )}

      {/* Header Stats & Symbol */}
      {subTab === 'header' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-slate-900">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><TrendingUp size={20} className="text-violet-400" /></div>
            <div><h2 className="text-white font-bold text-base">Header Stats & Community Symbol</h2><p className="text-slate-400 text-xs">Numbers & icon symbol displayed in the student app Teen Community banner</p></div>
          </div>
          <div className="p-6">
            {loadingHeader ? <div className="w-5 h-5 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin" /> : (
              <form onSubmit={saveHeader} className="space-y-6">
                
                {/* Community Symbol / Emoji Picker */}
                <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider">
                    Community Symbol / Icon
                  </label>
                  <p className="text-xs text-slate-400">Select a preset symbol or type a custom emoji for the Teen Community banner:</p>

                  <div className="flex flex-wrap gap-2">
                    {['🚀', '👥', '💬', '🌐', '🔥', '🏆', '👑', '⚡', '💎', '🎯', '🌟', '📢'].map(sym => (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => setHeaderForm({ ...headerForm, symbol: sym })}
                        className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all border ${
                          (headerForm.symbol || '🚀') === sym
                            ? 'bg-violet-600 border-violet-400 shadow-lg shadow-violet-900/60 scale-110'
                            : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-slate-400 font-semibold">Custom Symbol:</span>
                    <input
                      type="text"
                      value={headerForm.symbol || '🚀'}
                      onChange={e => setHeaderForm({ ...headerForm, symbol: e.target.value })}
                      placeholder="e.g. 🚀"
                      className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-center text-lg text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Stats Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-400 mb-2">Members (text)</label>
                    <input value={headerForm.members} onChange={e => setHeaderForm({ ...headerForm, members: e.target.value })} placeholder="2.4k" className={ic} /></div>
                  <div><label className="block text-xs font-semibold text-slate-400 mb-2">Posts Today</label>
                    <input type="number" value={headerForm.postsToday} onChange={e => setHeaderForm({ ...headerForm, postsToday: Number(e.target.value) })} className={ic} /></div>
                  <div><label className="block text-xs font-semibold text-slate-400 mb-2">Live Challenges</label>
                    <input type="number" value={headerForm.liveChallenges} onChange={e => setHeaderForm({ ...headerForm, liveChallenges: Number(e.target.value) })} className={ic} /></div>
                </div>

                {/* Preview & Save */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 border-t border-white/10">
                  <div className="bg-slate-800/60 rounded-xl px-4 py-2.5 text-sm flex-1 text-slate-300 w-full flex items-center gap-2">
                    <span className="text-xl">{headerForm.symbol || '🚀'}</span>
                    <span>Preview: <strong className="text-white">Teen Community {headerForm.symbol || '🚀'}</strong> · <span className="text-white font-bold">{headerForm.members}</span> Members · <span className="text-white font-bold">{headerForm.postsToday}</span> Posts · <span className="text-white font-bold">{headerForm.liveChallenges}</span> Challenges</span>
                  </div>
                  <button type="submit" disabled={savingHeader} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl text-sm flex-shrink-0 w-full sm:w-auto justify-center">
                    <Save size={15} />{savingHeader ? 'Saving...' : 'Save Symbol & Stats'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Finance Tips */}
      {subTab === 'tips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-blue-400" />Finance Tips</h2>
              <p className="text-slate-500 text-sm">Shown in Tips tab. Empty = default tips show to students.</p></div>
            <button onClick={() => setShowTipForm(!showTipForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm">
              {showTipForm ? <X size={15} /> : <Plus size={15} />}{showTipForm ? 'Cancel' : 'Add Tip'}
            </button>
          </div>
          {showTipForm && (
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <input value={tipForm.icon} onChange={e => setTipForm({ ...tipForm, icon: e.target.value })} placeholder="💡" className={ic + ' text-center text-xl'} />
                <input value={tipForm.title} onChange={e => setTipForm({ ...tipForm, title: e.target.value })} placeholder="Title *" className={ic + ' col-span-3'} />
              </div>
              <textarea value={tipForm.desc} onChange={e => setTipForm({ ...tipForm, desc: e.target.value })} placeholder="Description..." className={ic + ' resize-none'} rows={2} />
              <div className="flex justify-end">
                <button onClick={addTip} disabled={!tipForm.title.trim() || savingTips} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
                  {savingTips ? 'Saving...' : '+ Add Tip'}
                </button>
              </div>
            </div>
          )}
          {loadingTips ? <div className="p-8 text-center"><div className="inline-block w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          : tips.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
              <BookOpen size={36} className="text-slate-700 mx-auto mb-3" /><p className="text-slate-500">No custom tips yet.</p>
              <p className="text-slate-600 text-xs mt-1">Students see built-in tips until you add your own.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.map((tip, idx) => (
                <div key={idx} className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all group">
                  {editingTipIdx === idx ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <input value={tip.icon} onChange={e => updateTip(idx, 'icon', e.target.value)} className={ic + ' text-center text-xl'} />
                        <input value={tip.title} onChange={e => updateTip(idx, 'title', e.target.value)} className={ic + ' col-span-3'} />
                      </div>
                      <textarea value={tip.desc} onChange={e => updateTip(idx, 'desc', e.target.value)} className={ic + ' resize-none'} rows={2} />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingTipIdx(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg">Cancel</button>
                        <button onClick={() => saveEditedTip(idx)} disabled={savingTips}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-4 py-1.5 rounded-lg"><Save size={12} />Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="text-3xl"><UIIcon icon={tip.icon} className="w-8 h-8 inline-block" /></div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => setEditingTipIdx(idx)}
                            className="flex items-center gap-1 bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                            <Edit3 size={11} />Edit
                          </button>
                          <button onClick={() => deleteTip(idx)}
                            className="flex items-center gap-1 bg-red-600/15 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                            <Trash2 size={11} />Delete
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-white mb-1">{tip.title}</div>
                      <div className="text-slate-400 text-sm leading-relaxed">{tip.desc}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenges */}
      {subTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><Award size={18} className="text-amber-400" />Weekly Challenges</h2>
              <p className="text-slate-500 text-sm">Shown in Challenges tab. Empty = default challenges.</p></div>
            <button onClick={() => setShowChallengeForm(!showChallengeForm)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm">
              {showChallengeForm ? <X size={15} /> : <Plus size={15} />}{showChallengeForm ? 'Cancel' : 'Add Challenge'}
            </button>
          </div>
          {showChallengeForm && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <input value={challengeForm.emoji} onChange={e => setChallengeForm({ ...challengeForm, emoji: e.target.value })} placeholder="🎯" className={ic + ' text-center text-xl'} />
                <input value={challengeForm.title} onChange={e => setChallengeForm({ ...challengeForm, title: e.target.value })} placeholder="Title *" className={ic + ' col-span-3'} />
              </div>
              <input value={challengeForm.desc} onChange={e => setChallengeForm({ ...challengeForm, desc: e.target.value })} placeholder="Description" className={ic} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">XP Reward</label>
                  <input type="number" value={challengeForm.xp} onChange={e => setChallengeForm({ ...challengeForm, xp: e.target.value })} className={ic} /></div>
                <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Participants</label>
                  <input type="number" value={challengeForm.participants} onChange={e => setChallengeForm({ ...challengeForm, participants: e.target.value })} className={ic} /></div>
              </div>
              <div className="flex justify-end">
                <button onClick={addChallenge} disabled={!challengeForm.title.trim() || savingChallenges} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
                  {savingChallenges ? 'Saving...' : '+ Add Challenge'}
                </button>
              </div>
            </div>
          )}
          {loadingChallenges ? <div className="p-8 text-center"><div className="inline-block w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
          : challenges.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
              <Award size={36} className="text-slate-700 mx-auto mb-3" /><p className="text-slate-500">No custom challenges yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((c, idx) => (
                <div key={idx} className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
                  {editingChallengeIdx === idx ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <input value={c.emoji} onChange={e => updateChallenge(idx, 'emoji', e.target.value)} className={ic + ' text-center text-xl'} />
                        <input value={c.title} onChange={e => updateChallenge(idx, 'title', e.target.value)} className={ic + ' col-span-3'} />
                      </div>
                      <input value={c.desc} onChange={e => updateChallenge(idx, 'desc', e.target.value)} className={ic} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={c.xp} onChange={e => updateChallenge(idx, 'xp', Number(e.target.value))} className={ic} placeholder="XP" />
                        <input type="number" value={c.participants} onChange={e => updateChallenge(idx, 'participants', Number(e.target.value))} className={ic} placeholder="Participants" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingChallengeIdx(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg">Cancel</button>
                        <button onClick={() => saveEditedChallenge(idx)} disabled={savingChallenges}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-4 py-1.5 rounded-lg"><Save size={12} />Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{c.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">{c.title}</div>
                        <div className="text-slate-400 text-sm">{c.desc}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">+{c.xp} XP</span>
                          <span className="text-xs text-slate-500">{c.participants} participants</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setEditingChallengeIdx(idx)}
                          className="flex items-center gap-1 bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                          <Edit3 size={11} />Edit
                        </button>
                        <button onClick={() => deleteChallenge(idx)}
                          className="flex items-center gap-1 bg-red-600/15 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                          <Trash2 size={11} />Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learning Resources */}
      {subTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><ExternalLink size={18} className="text-violet-400" />Learning Resources</h2>
              <p className="text-slate-500 text-sm">Links under Learning Resources in Tips tab. Empty = defaults.</p></div>
            <button onClick={() => setShowResourceForm(!showResourceForm)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm">
              {showResourceForm ? <X size={15} /> : <Plus size={15} />}{showResourceForm ? 'Cancel' : 'Add Resource'}
            </button>
          </div>
          {showResourceForm && (
            <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-5 space-y-3">
              <input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="📖 Title *" className={ic} />
              <input type="url" value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://... *" className={ic} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Type</label>
                  <select value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })} className={ic}>
                    {['Article', 'Video', 'Guide', 'Course', 'Book'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Read Time (mins)</label>
                  <input type="number" value={resourceForm.mins} onChange={e => setResourceForm({ ...resourceForm, mins: e.target.value })} className={ic} /></div>
              </div>
              <div className="flex justify-end">
                <button onClick={addResource} disabled={!resourceForm.title.trim() || !resourceForm.url.trim() || savingResources}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
                  {savingResources ? 'Saving...' : '+ Add Resource'}
                </button>
              </div>
            </div>
          )}
          {loadingResources ? <div className="p-8 text-center"><div className="inline-block w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          : resources.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
              <ExternalLink size={36} className="text-slate-700 mx-auto mb-3" /><p className="text-slate-500">No custom resources yet.</p>
              <p className="text-slate-600 text-xs mt-1">Students see built-in links until you add your own.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((r, idx) => (
                <div key={idx} className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all group">
                  {editingResourceIdx === idx ? (
                    <div className="space-y-2">
                      <input value={r.title} onChange={e => updateResource(idx, 'title', e.target.value)} className={ic} />
                      <input type="url" value={r.url} onChange={e => updateResource(idx, 'url', e.target.value)} className={ic} />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={r.type} onChange={e => updateResource(idx, 'type', e.target.value)} className={ic}>
                          {['Article', 'Video', 'Guide', 'Course', 'Book'].map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input type="number" value={r.mins} onChange={e => updateResource(idx, 'mins', Number(e.target.value))} className={ic} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingResourceIdx(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg">Cancel</button>
                        <button onClick={() => saveEditedResource(idx)} disabled={savingResources}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-4 py-1.5 rounded-lg"><Save size={12} />Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">{r.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.type} · {r.mins} min read</div>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1 truncate">
                          <ExternalLink size={10} className="flex-shrink-0" /><span className="truncate">{r.url}</span></a>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setEditingResourceIdx(idx)}
                          className="flex items-center gap-1 bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                          <Edit3 size={11} />Edit
                        </button>
                        <button onClick={() => deleteResource(idx)}
                          className="flex items-center gap-1 bg-red-600/15 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                          <Trash2 size={11} />Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Community Posts */}
      {subTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={18} className="text-blue-400" />Community Posts</h2>
              <p className="text-slate-500 text-sm">All student posts — admin can delete any</p></div>
            <button onClick={fetchPosts} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 transition">
              <RefreshCw size={14} className={`text-slate-400 ${loadingPosts ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loadingPosts ? <div className="p-12 text-center"><div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          : posts.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
              <Users size={40} className="text-slate-700 mx-auto mb-3" /><p className="text-slate-500">No community posts yet.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-slate-500 uppercase text-xs tracking-wider">
                    <th className="text-left px-4 py-3">#</th><th className="text-left px-4 py-3">Author</th>
                    <th className="text-left px-4 py-3">Content</th><th className="text-left px-4 py-3">Tag</th>
                    <th className="text-left px-4 py-3">Likes</th><th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr></thead>
                  <tbody>
                    {posts.map((post, i) => (
                      <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2"><div className="text-xl">{post.avatar}</div>
                            <div><div className="text-white text-xs font-medium">{post.author}</div><div className="text-slate-500 text-xs">{post.badge}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs"><p className="text-slate-300 text-xs line-clamp-2">{post.content}</p></td>
                        <td className="px-4 py-3.5"><span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-semibold">{post.tag}</span></td>
                        <td className="px-4 py-3.5 text-slate-300 text-xs">{post.likes || 0} ❤️</td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">{post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => deletePost(post.id)} disabled={deletingPost === post.id}
                            className="bg-red-600/10 hover:bg-red-600/30 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg p-1.5 transition-all disabled:opacity-50">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-white/10 text-xs text-slate-600">{posts.length} post{posts.length !== 1 ? 's' : ''} total</div>
            </div>
          )}
        </div>
      )}

      {/* Flagged Posts */}
      {subTab === 'flags' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-orange-400" /> Flagged Posts
              </h2>
              <p className="text-slate-500 text-sm">Posts reported by students — review and take action</p>
            </div>
            <button onClick={fetchFlaggedPosts} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 transition">
              <RefreshCw size={14} className={`text-slate-400 ${loadingFlags ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingFlags ? (
            <div className="p-12 text-center"><div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : flaggedPosts.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
              <Shield size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No flagged posts — community is clean! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedPosts.map(fp => (
                <div key={fp.postId} className="bg-slate-900 border border-orange-500/30 rounded-2xl overflow-hidden">
                  {/* Post preview */}
                  <div className="px-5 py-4 border-b border-white/10 bg-orange-500/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-full">
                            🚩 {fp.reports.length} report{fp.reports.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-slate-500">by @{fp.postAuthor}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{fp.postContent}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => dismissAllReports(fp.postId)}
                          disabled={actioningFlag === fp.postId + '_dismiss' || actioningFlag === fp.postId + '_delete'}
                          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                          title="Keep the post but clear all reports"
                        >
                          <CheckCircle size={12} />
                          {actioningFlag === fp.postId + '_dismiss' ? 'Dismissing...' : 'Dismiss All'}
                        </button>
                        <button
                          onClick={() => deleteFlaggedPost(fp.postId)}
                          disabled={actioningFlag === fp.postId + '_dismiss' || actioningFlag === fp.postId + '_delete'}
                          className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 disabled:opacity-50 text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                          title="Permanently delete this post"
                        >
                          <Trash2 size={12} />
                          {actioningFlag === fp.postId + '_delete' ? 'Deleting...' : 'Delete Post'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Reports list */}
                  <div className="px-5 py-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reports</div>
                    {fp.reports.map(r => (
                      <div key={r.id} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-full">{r.reason}</span>
                        <span className="text-xs text-slate-400">by @{r.reporterUsername}</span>
                        <span className="text-xs text-slate-600 ml-auto">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
// ---- MAIN DASHBOARD ----
function AdminDashboard({ admin, onLogout }) {
  const [page, setPage] = useState('students')
  const [msgUnread, setMsgUnread] = useState(0)

  // Poll admin unread count every 15s
  useEffect(() => {
    async function fetchUnread() {
      try {
        const data = await adminApi('admin/messages/unread')
        setMsgUnread(data.unread || 0)
      } catch {}
    }
    fetchUnread()
    const t = setInterval(fetchUnread, 15000)
    return () => clearInterval(t)
  }, [])

  const nav = [
    { id:'students', label:'Students', icon: Users },
    { id:'books', label:'Book Library', icon: BookOpen },
    { id:'cert-search', label:'Certificate Lookup', icon: Award },
    { id:'messages', label:'Messages', icon: MessageSquare, badge: msgUnread },
    { id:'community', label:'Community & Support', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-white/10 flex flex-col fixed h-screen z-10">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="bg-white rounded-xl px-3 py-2 mb-3">
            <img src={LOGO_URL} alt="Grofience" className="h-7 object-contain"/>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1 w-fit">
            <Shield size={11} className="text-blue-400"/><span className="text-blue-300 text-xs font-semibold">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${page===n.id?'bg-blue-600 text-white shadow-lg shadow-blue-900/40':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <n.icon size={16}/><span className="flex-1 text-left">{n.label}</span>
              {n.badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{n.badge > 99 ? '99+' : n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="text-xs text-slate-500 px-4 py-2 truncate mb-1">{admin.email}</div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-xl transition-all">
            <LogOut size={14}/>Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-60 p-8 overflow-y-auto min-h-screen">
        {page==='students' && <StudentsView/>}
        {page==='books' && <BooksView/>}
        {page==='cert-search' && <CertSearchView/>}
        {page==='messages' && <MessagesView/>}
        {page==='community' && <CommunityView/>}
      </main>
    </div>
  )
}

// ---- ROOT ----
export default function AdminPage() {
  const [admin, setAdmin] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(()=>{
    const token = localStorage.getItem('grofience_admin_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp*1000>Date.now()) setAdmin({email:payload.email,role:'admin'})
        else localStorage.removeItem('grofience_admin_token')
      } catch { localStorage.removeItem('grofience_admin_token') }
    }
    setChecked(true)
  },[])

  function handleLogout() { localStorage.removeItem('grofience_admin_token'); setAdmin(null) }

  if (!checked) return null
  if (!admin) return <AdminLogin onLogin={setAdmin}/>
  return <AdminDashboard admin={admin} onLogout={handleLogout}/>
}
