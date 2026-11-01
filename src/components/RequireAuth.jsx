import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

/** UX guard only. Real protection is RLS in the database. */
export default function RequireAuth({ admin = false, children }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <p className="section" role="status">Ачаалж байна…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (admin && !isAdmin) return <section className="section"><h1>Хандах эрхгүй</h1><p>Энэ хуудас зөвхөн админд зориулагдсан.</p></section>
  return children
}
