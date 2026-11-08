import { afterEach, describe, expect, it } from 'vitest'
import { localize, setActiveLang } from '../src/features/prefs/prefs-context'

const row = { name: 'Д.Хулан', name_en: 'D. Khulan', bio: 'Монгол', bio_en: '', courses: ['А'], courses_en: [], position: 'Багш' }

describe('localize', () => {
  afterEach(() => setActiveLang('mn'))
  it('keeps the Mongolian row in MN', () => {
    expect(localize(row)).toBe(row)
  })
  it('uses non-empty English columns in EN and falls back for empty or missing ones', () => {
    setActiveLang('en')
    const r = localize(row)
    expect(r.name).toBe('D. Khulan')
    expect(r.bio).toBe('Монгол')
    expect(r.courses).toEqual(['А'])
    expect(r.position).toBe('Багш')
  })
})
