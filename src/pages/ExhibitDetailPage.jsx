import { Link, useParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getExhibit } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import LoadState from '../components/LoadState'
import { STATUS_LABELS } from '../features/exhibits/validate'
import { t } from '../features/prefs/prefs-context'

export default function ExhibitDetailPage() {
  const { id } = useParams()
  const { data, error, loading, reload } = useLoad(async () => {
    const exhibit = await getExhibit(id)
    return { exhibit, urls: exhibit ? await signedUrls([exhibit.image_path]) : {} }
  }, [id])
  const e = data?.exhibit
  return <section className="section">
    <LoadState loading={loading} error={error} reload={reload} empty={!e} emptyText={t('Бүтээл олдсонгүй эсвэл нийтлэгдээгүй байна.', 'Work not found or not published.')}>
      {e && <article className="detail">
        {data.urls[e.image_path] ? <img src={data.urls[e.image_path]} alt={e.title} /> : <div className="img-placeholder">{t('Зураггүй', 'No image')}</div>}
        <div>
          {e.status !== 'published' && <span className={`badge ${e.status}`}>{STATUS_LABELS[e.status]}</span>}
          <h1>{e.title}</h1>
          <p className="meta">{e.year_created} · {e.category?.name ?? t('Ангилалгүй', 'Uncategorized')} · {t('Бүтээгч', 'Creator')}: <Link to={`/creators/${e.creator.id}`}>{e.creator.display_name}</Link></p>
          {e.technology_stack.length > 0 && <ul className="tags">{e.technology_stack.map((t) => <li key={t}><Link to={`/exhibits?tech=${encodeURIComponent(t)}`}>{t}</Link></li>)}</ul>}
          <p className="prose">{e.description || t('Тайлбар оруулаагүй.', 'No description.')}</p>
          <p className="actions">
            {e.demo_url && <a className="button" href={e.demo_url} target="_blank" rel="noopener noreferrer">{t('Demo үзэх', 'Open demo')}</a>}
            {e.github_url && <a className="button secondary-light" href={e.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </p>
        </div>
      </article>}
    </LoadState>
    <Link to="/exhibits">← {t('Бүх бүтээл', 'All works')}</Link>
  </section>
}
