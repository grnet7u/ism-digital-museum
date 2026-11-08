import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { t } from '../features/prefs/prefs-context'

/** UX guard only. Real protection is RLS in the database. */
export default function RequireAuth({ admin = false, children }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <p className="section" role="status">{t('Ачаалж байна…', 'Loading…')}</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (admin && !isAdmin) return <section className="section"><h1>{t('Хандах эрхгүй', 'Access denied')}</h1><p>{t('Энэ хуудас зөвхөн админд зориулагдсан.', 'This page is for administrators only.')}</p></section>
  return children
}
