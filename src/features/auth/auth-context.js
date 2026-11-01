import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

/** UI hint only: the database checks the same app_metadata claim through RLS. */
export const isAdminUser = (user) => user?.app_metadata?.role === 'admin'

/** Returns a Mongolian error message, or '' when the form is valid. */
export function validateAuthForm({ email, password, displayName }, mode) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'И-мэйл хаяг буруу байна.'
  if (password.length < 8) return 'Нууц үг дор хаяж 8 тэмдэгт байна.'
  if (mode === 'register') {
    const name = displayName.trim()
    if (!name) return 'Нэрээ оруулна уу.'
    if (name.length > 80) return 'Нэр 80 тэмдэгтээс хэтрэхгүй.'
  }
  return ''
}
