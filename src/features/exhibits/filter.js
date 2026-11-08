import { normalizeTags } from '../evolution/aggregate'

/** Applies URL filters { q, year, category, tech } together; empty values are ignored. */
export function filterExhibits(exhibits, { q = '', year = '', category = '', tech = '' }) {
  const text = q.trim().toLowerCase()
  const wantedTech = tech.trim().toLowerCase()
  return exhibits.filter((e) =>
    (!text || e.title.toLowerCase().includes(text)) &&
    (!year || String(e.year_created) === year) &&
    (!category || e.category_id === category) &&
    (!wantedTech || normalizeTags(e.technology_stack).includes(wantedTech)))
}
