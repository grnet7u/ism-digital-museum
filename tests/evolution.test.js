import { describe, expect, it } from 'vitest'
import { compareYears, technologyCounts, yearSummary } from '../src/features/evolution/aggregate'
import { filterExhibits } from '../src/features/exhibits/filter'

const pub = (year, stack, extra = {}) => ({ status: 'published', year_created: year, technology_stack: stack, title: 'x', ...extra })

describe('technologyCounts', () => {
  it('counts a normalized tag once per published exhibit and scopes by year', () => {
    expect(technologyCounts([
      pub(2025, ['React', ' react ', '', null, 'SQL']),
      pub(2025, ['REACT']),
      { status: 'pending', year_created: 2025, technology_stack: ['secret'] },
      pub(2024, ['legacy']),
    ], 2025)).toEqual([{ technology: 'react', count: 2 }, { technology: 'sql', count: 1 }])
  })
  it('handles no records and absent technology lists', () => {
    expect(technologyCounts([], 2025)).toEqual([])
    expect(technologyCounts([{ status: 'published', year_created: 2025 }], 2025)).toEqual([])
  })
})

describe('yearSummary', () => {
  it('orders years, counts null years separately, ignores unpublished', () => {
    expect(yearSummary([pub(2025, []), pub(2023, []), pub(2025, []), pub(null, []),
      { status: 'draft', year_created: 2020, technology_stack: [] }]))
      .toEqual({ years: [{ year: 2023, count: 1 }, { year: 2025, count: 2 }], unknownYear: 1 })
    expect(yearSummary([])).toEqual({ years: [], unknownYear: 0 })
  })
})

describe('compareYears', () => {
  it('uses the union of both years with 0 for the missing side', () => {
    const data = [pub(2024, ['PHP', 'SQL']), pub(2025, ['React', 'sql ']), pub(2025, ['react'])]
    expect(compareYears(data, 2024, 2025)).toEqual([
      { technology: 'react', a: 0, b: 2 },
      { technology: 'sql', a: 1, b: 1 },
      { technology: 'php', a: 1, b: 0 },
    ])
  })
  it('returns nothing for a year without data', () => {
    expect(compareYears([pub(2024, ['php'])], 2030, 2031)).toEqual([])
  })
})

describe('filterExhibits', () => {
  const data = [
    pub(2024, ['React'], { id: 1, title: 'Museum App', category_id: 'web' }),
    pub(2025, [' react', 'SQL'], { id: 2, title: 'Library', category_id: 'web' }),
    pub(2025, ['Flutter'], { id: 3, title: 'museum mobile', category_id: 'mobile' }),
  ]
  const ids = (f) => filterExhibits(data, f).map((e) => e.id)
  it('combines case-insensitive title search with year/category/technology', () => {
    expect(ids({ q: ' MUSEUM ' })).toEqual([1, 3])
    expect(ids({ year: '2025', tech: 'react' })).toEqual([2])
    expect(ids({ q: 'museum', category: 'web' })).toEqual([1])
    expect(ids({})).toEqual([1, 2, 3])
    expect(ids({ year: '2025', tech: 'php' })).toEqual([])
  })
})
