import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

/** The Supabase client reads the confirmation token from this URL itself (detectSessionInUrl). */
export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)
  const urlError = new URLSearchParams(window.location.hash.slice(1) || window.location.search).get('error_description')

  useEffect(() => { const id = setTimeout(() => setTimedOut(true), 8000); return () => clearTimeout(id) }, [])

  if (user) return <Navigate to="/my-works" replace />
  if (urlError || (timedOut && !loading)) return <section className="section narrow">
    <h1>Баталгаажуулалт амжилтгүй</h1>
    <p className="error" role="alert">{urlError ?? 'Холбоос хүчингүй эсвэл хугацаа нь дууссан байж магадгүй.'}</p>
    <Link to="/login">Нэвтрэх хуудас руу</Link>
  </section>
  return <p className="section" role="status">Баталгаажуулж байна…</p>
}
