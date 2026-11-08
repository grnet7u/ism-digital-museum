import { useEffect, useState } from 'react'
import { PrefsContext, setActiveLang } from './prefs-context'

// Browser storage may be blocked (private mode); preferences then just reset on reload.
const read = (key) => { try { return localStorage.getItem(key) } catch { return null } }
const write = (key, value) => { try { localStorage.setItem(key, value) } catch { /* ignore */ } }

export default function PrefsProvider({ children }) {
  const [lang, setLang] = useState(() => (read('lang') === 'en' ? 'en' : 'mn'))
  // index.html already set data-theme before first paint (no light flash).
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  setActiveLang(lang)

  useEffect(() => { document.documentElement.lang = lang; write('lang', lang) }, [lang])
  useEffect(() => { document.documentElement.dataset.theme = theme; write('theme', theme) }, [theme])

  return <PrefsContext.Provider value={{ lang, theme,
    toggleLang: () => setLang((l) => (l === 'mn' ? 'en' : 'mn')),
    toggleTheme: () => setTheme((x) => (x === 'dark' ? 'light' : 'dark')) }}>
    {children}
  </PrefsContext.Provider>
}
