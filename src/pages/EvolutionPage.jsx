import { Link, useSearchParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { listPublishedExhibits } from '../services/exhibits'
import { compareYears, yearSummary } from '../features/evolution/aggregate'
import LoadState from '../components/LoadState'
import { t } from '../features/prefs/prefs-context'

const worksLink = (year, tech) => `/exhibits?${new URLSearchParams({ year: String(year), ...(tech && { tech }) })}`

export default function EvolutionPage() {
  const { data, error, loading, reload } = useLoad(listPublishedExhibits, [])
  const [params, setParams] = useSearchParams()
  const { years, unknownYear } = yearSummary(data ?? [])
  const list = years.map((y) => y.year)
  // Default: the two latest years; a URL year without published works falls back to the default.
  const pick = (key, fallback) => (list.includes(Number(params.get(key))) ? Number(params.get(key)) : fallback)
  const a = pick('a', list.at(-2) ?? list.at(-1))
  const b = pick('b', list.at(-1))
  const rows = data && a != null ? compareYears(data, a, b) : []
  const max = Math.max(1, ...rows.flatMap((r) => [r.a, r.b]))
  const choose = (key, value) => setParams({ a: String(a), b: String(b), [key]: value })

  return <section className="section">
    <h1>{t('Технологийн хувьсал', 'Technology Evolution')}</h1>
    <p className="muted">{t('Нийтлэгдсэн бүтээлүүдэд ашигласан технологийг оноор харьцуулна. Тоо нь тухайн технологийг ашигласан ', 'Compares technologies used in published works by year. Each number is the ')}<strong>{t('бүтээлийн тоо', 'count of works')}</strong>{t(' (зах зээлийн хувь биш). Нэг бүтээл олон технологитой байж болох тул технологиудын нийлбэр бүтээлийн тооноос их гарч болно.', ' using that technology (not market share). A work can use several technologies, so the totals can exceed the number of works.')}</p>
    <LoadState loading={loading} error={error} reload={reload} empty={!years.length} emptyText={t('Он бүхий нийтлэгдсэн бүтээл алга тул харьцуулах өгөгдөл байхгүй.', 'No published works with a year, so there is nothing to compare.')}>
      <h2>{t('Он', 'Years')}</h2>
      <ol className="year-line">{years.map((y) => <li key={y.year}><Link to={worksLink(y.year)}><strong>{y.year}</strong> <span>{y.count} {t('бүтээл', 'works')}</span></Link></li>)}</ol>
      {unknownYear > 0 && <p className="note">{t(`Он тодорхойгүй ${unknownYear} бүтээл харьцуулалтад ороогүй.`, `${unknownYear} work(s) without a year are excluded from the comparison.`)}</p>}

      <h2>{t('Хоёр оныг харьцуулах', 'Compare two years')}</h2>
      <div className="filters">
        {[['a', a, t('Эхний он', 'First year')], ['b', b, t('Хоёр дахь он', 'Second year')]].map(([key, value, label]) => <label key={key}>{label}
          <select value={value} onChange={(e) => choose(key, e.target.value)}>{list.map((y) => <option key={y}>{y}</option>)}</select>
        </label>)}
      </div>
      {rows.length === 0 ? <p className="empty">{t('Сонгосон онуудад технологи бүртгэгдээгүй.', 'No technologies recorded for the selected years.')}</p> : <>
        <div className="bars" aria-hidden="true">{rows.map((r) => <div key={r.technology} className="bar-row">
          <span className="bar-label">{r.technology}</span>
          <div>
            {[['a', r.a], ['b', r.b]].map(([k, n]) => <span key={k} className={`bar ${n ? k : 'zero'}`} style={{ width: `${(n / max) * 100}%` }}>{n}</span>)}
          </div>
        </div>)}</div>
        <p className="legend" aria-hidden="true"><span className="swatch a" /> {a} &nbsp; <span className="swatch b" /> {b}</p>
        <table className="data-table">
          <caption>{t(`Технологи ашигласан бүтээлийн тоо (${a} ба ${b}). Тоон дээр дарж тухайн бүтээлүүдийг үзнэ.`, `Works using each technology (${a} vs ${b}). Click a number to see those works.`)}</caption>
          <thead><tr><th scope="col">{t('Технологи', 'Technology')}</th><th scope="col">{a}</th><th scope="col">{b}</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.technology}><th scope="row">{r.technology}</th>
            {[[a, r.a], [b, r.b]].map(([year, count], i) => <td key={i}>{count ? <Link to={worksLink(year, r.technology)}>{count}</Link> : 0}</td>)}
          </tr>)}</tbody>
        </table>
      </>}
    </LoadState>
  </section>
}
