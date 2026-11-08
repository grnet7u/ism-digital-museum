import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { t } from '../features/prefs/prefs-context'

/** The Supabase client reads the confirmation token from this URL itself (detectSessionInUrl). */
export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)
  const urlError = new URLSearchParams(window.location.hash.slice(1) || window.location.search).get('error_description')

  useEffect(() => { const id = setTimeout(() => setTimedOut(true), 8000); return () => clearTimeout(id) }, [])

  if (user) return <Navigate to="/my-works" replace />
  if (urlError || (timedOut && !loading)) return <section className="section narrow">
    <h1>{t('Баталгаажуулалт амжилтгүй', 'Confirmation failed')}</h1>
    <p className="error" role="alert">{urlError ?? t('Холбоос хүчингүй эсвэл хугацаа нь дууссан байж магадгүй.', 'The link may be invalid or expired.')}</p>
    <Link to="/login">{t('Нэвтрэх хуудас руу', 'Go to login')}</Link>
  </section>
  return <p className="section" role="status">{t('Баталгаажуулж байна…', 'Confirming…')}</p>
}
