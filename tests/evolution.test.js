import { describe, expect, it } from 'vitest'
import { technologyCounts } from '../src/features/evolution/aggregate'

describe('technologyCounts', () => {
  it('counts a normalized tag once per published exhibit and scopes by year', () => {
    expect(technologyCounts([
      { status: 'published', year_created: 2025, technology_stack: ['React', ' react ', '', null, 'SQL'] },
      { status: 'published', year_created: 2025, technology_stack: ['REACT'] },
      { status: 'pending', year_created: 2025, technology_stack: ['secret'] },
      { status: 'published', year_created: 2024, technology_stack: ['legacy'] },
    ], 2025)).toEqual([{ technology: 'react', count: 2 }, { technology: 'sql', count: 1 }])
  })
  it('handles no records and absent technology lists', () => {
    expect(technologyCounts([], 2025)).toEqual([])
    expect(technologyCounts([{ status: 'published', year_created: 2025 }], 2025)).toEqual([])
  })
})
