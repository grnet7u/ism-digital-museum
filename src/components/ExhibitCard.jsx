import { Link } from 'react-router-dom'
import { STATUS_LABELS } from '../features/exhibits/validate'

export default function ExhibitCard({ exhibit, imageUrl, showStatus = false, children }) {
  return <article className="card exhibit-card">
    {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <div className="img-placeholder" aria-hidden="true">Зураггүй</div>}
    <div className="card-body">
      {showStatus && <span className={`badge ${exhibit.status}`}>{STATUS_LABELS[exhibit.status]}</span>}
      <h3><Link to={`/exhibits/${exhibit.id}`}>{exhibit.title}</Link></h3>
      <p className="meta">{exhibit.year_created ?? '—'} · {exhibit.category?.name ?? 'Ангилалгүй'}{exhibit.creator && !showStatus ? ` · ${exhibit.creator.display_name}` : ''}</p>
      {exhibit.technology_stack.length > 0 && <ul className="tags">{exhibit.technology_stack.map((t) => <li key={t}>{t}</li>)}</ul>}
      {children}
    </div>
  </article>
}
