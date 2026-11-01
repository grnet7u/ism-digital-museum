import { Link, useParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getEvent, listEvents } from '../services/content'
import { signedUrls } from '../services/storage'
import LoadState from '../components/LoadState'
import { formatDate } from '../lib/format'

export function EventsPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const events = await listEvents()
    return { events, urls: await signedUrls(events.map((e) => e.cover_image_path)) }
  }, [])
  return <section className="section">
    <h1>Арга хэмжээ</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.events.length} emptyText="Нийтлэгдсэн арга хэмжээ одоогоор алга.">
      <div className="grid">{data?.events.map((ev) => <article key={ev.id} className="card exhibit-card">
        {data.urls[ev.cover_image_path] ? <img src={data.urls[ev.cover_image_path]} alt="" /> : <div className="img-placeholder" aria-hidden="true">Зураггүй</div>}
        <div className="card-body">
          {!ev.published && <span className="badge draft">Нийтлээгүй</span>}
          <h3><Link to={`/events/${ev.id}`}>{ev.title}</Link></h3>
          <p className="meta"><time dateTime={ev.event_date}>{formatDate(ev.event_date)}</time></p>
        </div>
      </article>)}</div>
    </LoadState>
  </section>
}

export function EventDetailPage() {
  const { id } = useParams()
  const { data, error, loading, reload } = useLoad(async () => {
    const event = await getEvent(id)
    if (!event) return { event }
    return { event, urls: await signedUrls([event.cover_image_path, ...event.photos.map((p) => p.image_path)]) }
  }, [id])
  const ev = data?.event
  return <section className="section">
    <LoadState loading={loading} error={error} reload={reload} empty={!ev} emptyText="Арга хэмжээ олдсонгүй.">
      {ev && <>
        {!ev.published && <span className="badge draft">Нийтлээгүй</span>}
        <h1>{ev.title}</h1>
        <p className="meta"><time dateTime={ev.event_date}>{formatDate(ev.event_date)}</time></p>
        {ev.description && <p className="prose">{ev.description}</p>}
        <h2>Зурагт цомог</h2>
        {ev.photos.length === 0 ? <p className="empty">Цомогт зураг ороогүй байна.</p>
          : <div className="album">{ev.photos.map((p) => <figure key={p.id}>
              {data.urls[p.image_path] ? <img src={data.urls[p.image_path]} alt={p.caption || ev.title} loading="lazy" /> : <div className="img-placeholder">Зураг ачаалагдсангүй</div>}
              {p.caption && <figcaption>{p.caption}</figcaption>}
            </figure>)}</div>}
      </>}
    </LoadState>
    <Link to="/events">← Бүх арга хэмжээ</Link>
  </section>
}
