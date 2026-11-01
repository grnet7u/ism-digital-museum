import { describe, expect, it } from 'vitest'
import { parseTechnologies, validateExhibit, validateImage } from '../src/features/exhibits/validate'

const valid = { title: 'Музейн апп', description: '', year_created: '2025', category_id: 'c1', technologies: 'React, SQL', demo_url: '', github_url: 'https://github.com/x/y' }

describe('parseTechnologies', () => {
  it('trims, drops blanks and dedupes case-insensitively keeping first spelling', () => {
    expect(parseTechnologies(' React, react ,, SQL,REACT ')).toEqual(['React', 'SQL'])
    expect(parseTechnologies('')).toEqual([])
  })
})

describe('validateExhibit', () => {
  it('accepts a valid form', () => expect(validateExhibit(valid, 2026)).toEqual({}))
  it('rejects blank title, bad years, missing category and non-http links', () => {
    const e = validateExhibit({ ...valid, title: '  ', year_created: '-5', category_id: '', demo_url: 'javascript:alert(1)' }, 2026)
    expect(Object.keys(e).sort()).toEqual(['category_id', 'demo_url', 'title', 'year_created'])
    expect(validateExhibit({ ...valid, year_created: '2028' }, 2026).year_created).toBeTruthy()
    expect(validateExhibit({ ...valid, year_created: '2025.5' }, 2026).year_created).toBeTruthy()
    expect(validateExhibit({ ...valid, github_url: 'ftp://x' }, 2026).github_url).toBeTruthy()
  })
})

describe('validateImage', () => {
  it('allows no file, JPEG/PNG/WebP up to 5 MB only', () => {
    expect(validateImage(null)).toBe('')
    expect(validateImage({ type: 'image/png', size: 1000 })).toBe('')
    expect(validateImage({ type: 'image/gif', size: 1000 })).not.toBe('')
    expect(validateImage({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 })).not.toBe('')
  })
})
