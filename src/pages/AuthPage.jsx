import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, validateAuthForm } from '../features/auth/auth-context'

const authErrors = {
  'Invalid login credentials': 'И-мэйл эсвэл нууц үг буруу байна.',
  'Email not confirmed': 'И-мэйлээ баталгаажуулаагүй байна. Ирсэн холбоос дээр дарна уу.',
  'User already registered': 'Энэ и-мэйлээр бүртгэл үүссэн байна.',
}

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { user } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from ?? '/my-works'
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    const invalid = validateAuthForm(form, mode)
    setError(invalid); setNotice('')
    if (invalid) return
    if (!supabase) return setError('Supabase тохируулаагүй тул нэвтрэх боломжгүй.')
    setBusy(true)
    const email = form.email.trim()
    const { data, error: authError } = isRegister
      ? await supabase.auth.signUp({ email, password: form.password, options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: form.displayName.trim() } } })
      : await supabase.auth.signInWithPassword({ email, password: form.password })
    setBusy(false)
    if (authError) return setError(authErrors[authError.message] ?? authError.message)
    if (isRegister && !data.session) return setNotice('Бүртгэл үүслээ. И-мэйлээ шалгаж баталгаажуулах холбоос дээр дарна уу.')
    navigate(from, { replace: true })
  }

  return <section className="section narrow">
    <h1>{isRegister ? 'Бүртгүүлэх' : 'Нэвтрэх'}</h1>
    <form className="form" onSubmit={submit} noValidate>
      {isRegister && <label>Нэр (нийтэд харагдана)<input name="displayName" value={form.displayName} onChange={change} maxLength={80} autoComplete="name" required /></label>}
      <label>И-мэйл<input name="email" type="email" value={form.email} onChange={change} autoComplete="email" required /></label>
      <label>Нууц үг<input name="password" type="password" value={form.password} onChange={change} minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      <button className="button" disabled={busy}>{busy ? 'Түр хүлээнэ үү…' : isRegister ? 'Бүртгүүлэх' : 'Нэвтрэх'}</button>
    </form>
    <p>{isRegister ? <>Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link></> : <>Шинэ хэрэглэгч үү? <Link to="/register">Бүртгүүлэх</Link></>}</p>
  </section>
}
