import { useSearchParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { listCategories, listPublishedExhibits } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import { normalizeTags, yearSummary } from '../features/evolution/aggregate'
import { filterExhibits } from '../features/exhibits/filter'
import ExhibitCard from '../components/ExhibitCard'
import LoadState from '../components/LoadState'
import { t } from '../features/prefs/prefs-context'

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
    <h1>{t('Бүтээлүүд', 'Exhibits')}</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!exhibits.length} emptyText={t('Нийтлэгдсэн бүтээл одоогоор алга.', 'No published works yet.')}>
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label>{t('Гарчгаар хайх', 'Search by title')}<input type="search" value={filters.q} onChange={(e) => setFilter('q', e.target.value, true)} /></label>
        <label>{t('Он', 'Year')}<select value={filters.year} onChange={(e) => setFilter('year', e.target.value)}>
          <option value="">{t('Бүх он', 'All years')}</option>{years.map((y) => <option key={y}>{y}</option>)}
        </select></label>
        <label>{t('Ангилал', 'Category')}<select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
          <option value="">{t('Бүх ангилал', 'All categories')}</option>{data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        <label>{t('Технологи', 'Technology')}<select value={filters.tech} onChange={(e) => setFilter('tech', e.target.value)}>
          <option value="">{t('Бүх технологи', 'All technologies')}</option>{techs.map((t) => <option key={t}>{t}</option>)}
        </select></label>
        {active && <button type="button" className="button secondary-light" onClick={reset}>{t('Цэвэрлэх', 'Reset')}</button>}
      </form>
      <p className="muted" role="status">{shown.length} / {exhibits.length} {t('бүтээл', 'works')}</p>
      {shown.length
        ? <div className="grid">{shown.map((e) => <ExhibitCard key={e.id} exhibit={e} imageUrl={data.urls[e.image_path]} />)}</div>
        : <p className="empty">{t('Шүүлтүүрт тохирох бүтээл олдсонгүй.', 'No works match these filters.')} <button type="button" className="link-button" onClick={reset}>{t('Шүүлтүүр цэвэрлэх', 'Clear filters')}</button></p>}
    </LoadState>
  </section>
}
