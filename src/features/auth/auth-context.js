import { createContext, useContext } from 'react'
import { t } from '../prefs/prefs-context'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

/** UI hint only: the database checks the same app_metadata claim through RLS. */
export const isAdminUser = (user) => user?.app_metadata?.role === 'admin'

/** Returns an error message in the active language, or '' when the form is valid. */
export function validateAuthForm({ email, password, displayName }, mode) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t('И-мэйл хаяг буруу байна.', 'Invalid e-mail address.')
  if (password.length < 8) return t('Нууц үг дор хаяж 8 тэмдэгт байна.', 'Password must be at least 8 characters.')
  if (mode === 'register') {
    const name = displayName.trim()
    if (!name) return t('Нэрээ оруулна уу.', 'Enter your name.')
    if (name.length > 80) return t('Нэр 80 тэмдэгтээс хэтрэхгүй.', 'Name must be at most 80 characters.')
  }
  return ''
}
