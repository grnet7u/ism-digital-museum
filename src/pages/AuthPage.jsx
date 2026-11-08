import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, validateAuthForm } from '../features/auth/auth-context'
import { t } from '../features/prefs/prefs-context'

const authErrors = () => ({
  'Invalid login credentials': t('И-мэйл эсвэл нууц үг буруу байна.', 'Wrong e-mail or password.'),
  'Email not confirmed': t('И-мэйлээ баталгаажуулаагүй байна. Ирсэн холбоос дээр дарна уу.', 'E-mail not confirmed yet. Click the link we sent you.'),
  'User already registered': t('Энэ и-мэйлээр бүртгэл үүссэн байна.', 'An account with this e-mail already exists.'),
})

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
    if (!supabase) return setError(t('Supabase тохируулаагүй тул нэвтрэх боломжгүй.', 'Supabase is not configured, so login is unavailable.'))
    setBusy(true)
    const email = form.email.trim()
    const { data, error: authError } = isRegister
      ? await supabase.auth.signUp({ email, password: form.password, options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: form.displayName.trim() } } })
      : await supabase.auth.signInWithPassword({ email, password: form.password })
    setBusy(false)
    if (authError) return setError(authErrors()[authError.message] ?? authError.message)
    if (isRegister && !data.session) return setNotice(t('Бүртгэл үүслээ. И-мэйлээ шалгаж баталгаажуулах холбоос дээр дарна уу.', 'Account created. Check your e-mail and click the confirmation link.'))
    navigate(from, { replace: true })
  }

  return <section className="section narrow">
    <h1>{isRegister ? t('Бүртгүүлэх', 'Sign up') : t('Нэвтрэх', 'Log in')}</h1>
    <form className="form" onSubmit={submit} noValidate>
      {isRegister && <label>{t('Нэр (нийтэд харагдана)', 'Name (shown publicly)')}<input name="displayName" value={form.displayName} onChange={change} maxLength={80} autoComplete="name" required /></label>}
      <label>{t('И-мэйл', 'E-mail')}<input name="email" type="email" value={form.email} onChange={change} autoComplete="email" required /></label>
      <label>{t('Нууц үг', 'Password')}<input name="password" type="password" value={form.password} onChange={change} minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      <button className="button" disabled={busy}>{busy ? t('Түр хүлээнэ үү…', 'Please wait…') : isRegister ? t('Бүртгүүлэх', 'Sign up') : t('Нэвтрэх', 'Log in')}</button>
    </form>
    <p>{isRegister ? <>{t('Бүртгэлтэй юу?', 'Have an account?')} <Link to="/login">{t('Нэвтрэх', 'Log in')}</Link></> : <>{t('Шинэ хэрэглэгч үү?', 'New here?')} <Link to="/register">{t('Бүртгүүлэх', 'Sign up')}</Link></>}</p>
  </section>
}
