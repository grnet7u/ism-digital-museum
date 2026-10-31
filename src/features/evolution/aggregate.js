/** Counts each normalized technology once per published exhibit in a selected year. */
export function technologyCounts(exhibits, year) {
  const counts = new Map()
  for (const exhibit of exhibits) {
    if (exhibit.status !== 'published' || exhibit.year_created !== year) continue
    const tags = new Set((exhibit.technology_stack ?? [])
      .filter((tag) => typeof tag === 'string')
      .map((tag) => tag.trim().toLowerCase()).filter(Boolean))
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts].map(([technology, count]) => ({ technology, count }))
    .sort((a, b) => b.count - a.count || a.technology.localeCompare(b.technology))
}
