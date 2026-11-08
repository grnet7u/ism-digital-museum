/** Trimmed, lower-cased, unique technology names of one exhibit. */
export const normalizeTags = (stack) => [...new Set((stack ?? [])
  .filter((tag) => typeof tag === 'string')
  .map((tag) => tag.trim().toLowerCase()).filter(Boolean))]

const published = (exhibits) => exhibits.filter((e) => e.status === 'published')

/** Counts each normalized technology once per published exhibit in a selected year. */
export function technologyCounts(exhibits, year) {
  const counts = new Map()
  for (const exhibit of published(exhibits)) {
    if (exhibit.year_created !== year) continue
    for (const tag of normalizeTags(exhibit.technology_stack)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts].map(([technology, count]) => ({ technology, count }))
    .sort((a, b) => b.count - a.count || a.technology.localeCompare(b.technology))
}

/** Ascending years with exhibit counts; exhibits without a year are counted separately. */
export function yearSummary(exhibits) {
  const counts = new Map()
  let unknownYear = 0
  for (const { year_created: year } of published(exhibits)) {
    if (year == null) unknownYear++
    else counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return { years: [...counts].sort((a, b) => a[0] - b[0]).map(([year, count]) => ({ year, count })), unknownYear }
}

/** Union of technologies used in either year: [{ technology, a, b }], missing side = 0. */
export function compareYears(exhibits, yearA, yearB) {
  const rows = new Map()
  for (const { technology, count } of technologyCounts(exhibits, yearA)) rows.set(technology, { technology, a: count, b: 0 })
  for (const { technology, count } of technologyCounts(exhibits, yearB)) {
    rows.set(technology, { technology, a: rows.get(technology)?.a ?? 0, b: count })
  }
  return [...rows.values()].sort((x, y) => y.a + y.b - (x.a + x.b) || x.technology.localeCompare(y.technology))
}
