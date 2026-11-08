import { Link, useSearchParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { listPublishedExhibits } from '../services/exhibits'
import { compareYears, yearSummary } from '../features/evolution/aggregate'
import LoadState from '../components/LoadState'

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
    <h1>Технологийн хувьсал</h1>
    <p className="muted">Нийтлэгдсэн бүтээлүүдэд ашигласан технологийг оноор харьцуулна. Тоо нь тухайн технологийг ашигласан <strong>бүтээлийн тоо</strong> (зах зээлийн хувь биш). Нэг бүтээл олон технологитой байж болох тул технологиудын нийлбэр бүтээлийн тооноос их гарч болно.</p>
    <LoadState loading={loading} error={error} reload={reload} empty={!years.length} emptyText="Он бүхий нийтлэгдсэн бүтээл алга тул харьцуулах өгөгдөл байхгүй.">
      <h2>Он</h2>
      <ol className="year-line">{years.map((y) => <li key={y.year}><Link to={worksLink(y.year)}><strong>{y.year}</strong> <span>{y.count} бүтээл</span></Link></li>)}</ol>
      {unknownYear > 0 && <p className="note">Он тодорхойгүй {unknownYear} бүтээл харьцуулалтад ороогүй.</p>}

      <h2>Хоёр оныг харьцуулах</h2>
      <div className="filters">
        {[['a', a, 'Эхний он'], ['b', b, 'Хоёр дахь он']].map(([key, value, label]) => <label key={key}>{label}
          <select value={value} onChange={(e) => choose(key, e.target.value)}>{list.map((y) => <option key={y}>{y}</option>)}</select>
        </label>)}
      </div>
      {rows.length === 0 ? <p className="empty">Сонгосон онуудад технологи бүртгэгдээгүй.</p> : <>
        <div className="bars" aria-hidden="true">{rows.map((r) => <div key={r.technology} className="bar-row">
          <span className="bar-label">{r.technology}</span>
          <div>
            <span className="bar a" style={{ width: `${(r.a / max) * 100}%` }}>{r.a}</span>
            <span className="bar b" style={{ width: `${(r.b / max) * 100}%` }}>{r.b}</span>
          </div>
        </div>)}</div>
        <p className="legend" aria-hidden="true"><span className="swatch a" /> {a} &nbsp; <span className="swatch b" /> {b}</p>
        <table className="data-table">
          <caption>Технологи ашигласан бүтээлийн тоо ({a} ба {b}). Тоон дээр дарж тухайн бүтээлүүдийг үзнэ.</caption>
          <thead><tr><th scope="col">Технологи</th><th scope="col">{a}</th><th scope="col">{b}</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.technology}><th scope="row">{r.technology}</th>
            {[[a, r.a], [b, r.b]].map(([year, count], i) => <td key={i}>{count ? <Link to={worksLink(year, r.technology)}>{count}</Link> : 0}</td>)}
          </tr>)}</tbody>
        </table>
      </>}
    </LoadState>
  </section>
}
