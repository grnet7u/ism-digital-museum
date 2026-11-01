import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AuthContext, isAdminUser } from './auth-context'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    // Restores the stored session on reload; the listener tracks login, logout and token refresh.
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const user = session?.user ?? null
  const value = { session, user, loading, isAdmin: isAdminUser(user), signOut: () => supabase.auth.signOut() }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
