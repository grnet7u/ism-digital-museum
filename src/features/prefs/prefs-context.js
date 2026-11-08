import { createContext, useContext } from 'react'

let current = 'mn'
/** Called by PrefsProvider during render so plain helpers (validation, dates) see the active language. */
export const setActiveLang = (lang) => { current = lang }
/** Inline bilingual string: t('Бүтээлүүд', 'Exhibits'). */
export const t = (mn, en) => (current === 'en' ? en : mn)
/** DB row in the active language: in EN, each non-empty `<field>_en` replaces `<field>`; empty ones keep the Mongolian value. */
export const localize = (row) => t(row, Object.fromEntries(Object.entries(row).map(([k, v]) => {
  const en = row[`${k}_en`]
  return [k, (Array.isArray(en) ? en.length : en) ? en : v]
})))

export const PrefsContext = createContext({ lang: 'mn', theme: 'light' })
export const usePrefs = () => useContext(PrefsContext)
/** Subscribes the component to language changes, then returns t. */
export const useT = () => { useContext(PrefsContext); return t }
