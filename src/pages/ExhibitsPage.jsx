import { useSearchParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { listCategories, listPublishedExhibits } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import { normalizeTags, yearSummary } from '../features/evolution/aggregate'
import { filterExhibits } from '../features/exhibits/filter'
import ExhibitCard from '../components/ExhibitCard'
import LoadState from '../components/LoadState'

async function loadExhibits() {
  const [exhibits, categories] = await Promise.all([listPublishedExhibits(), listCategories()])
  return { exhibits, categories, urls: await signedUrls(exhibits.map((e) => e.image_path)) }
}

const KEYS = ['q', 'year', 'category', 'tech']

export default function ExhibitsPage() {
  const { data, error, loading, reload } = useLoad(loadExhibits, [])
  const [params, setParams] = useSearchParams()
  const filters = Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? '']))
  const active = KEYS.some((k) => filters[k])

  // Typing replaces the history entry; choosing a filter adds one so Back undoes it.
  const setFilter = (key, value, replace = false) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace })
  }
  const reset = () => setParams({})

  const exhibits = data?.exhibits ?? []
  const shown = filterExhibits(exhibits, filters)
  const years = yearSummary(exhibits).years.map((y) => y.year).reverse()
  const techs = [...new Set(exhibits.flatMap((e) => normalizeTags(e.technology_stack)))].sort()

  return <section className="section">
    <h1>Бүтээлүүд</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!exhibits.length} emptyText="Нийтлэгдсэн бүтээл одоогоор алга.">
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label>Гарчгаар хайх<input type="search" value={filters.q} onChange={(e) => setFilter('q', e.target.value, true)} /></label>
        <label>Он<select value={filters.year} onChange={(e) => setFilter('year', e.target.value)}>
          <option value="">Бүх он</option>{years.map((y) => <option key={y}>{y}</option>)}
        </select></label>
        <label>Ангилал<select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
          <option value="">Бүх ангилал</option>{data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        <label>Технологи<select value={filters.tech} onChange={(e) => setFilter('tech', e.target.value)}>
          <option value="">Бүх технологи</option>{techs.map((t) => <option key={t}>{t}</option>)}
        </select></label>
        {active && <button type="button" className="button secondary-light" onClick={reset}>Цэвэрлэх</button>}
      </form>
      <p className="muted" role="status">{shown.length} / {exhibits.length} бүтээл</p>
      {shown.length
        ? <div className="grid">{shown.map((e) => <ExhibitCard key={e.id} exhibit={e} imageUrl={data.urls[e.image_path]} />)}</div>
        : <p className="empty">Шүүлтүүрт тохирох бүтээл олдсонгүй. <button type="button" className="link-button" onClick={reset}>Шүүлтүүр цэвэрлэх</button></p>}
    </LoadState>
  </section>
}
