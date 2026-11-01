import { Link, useParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getCreator, listCreators } from '../services/content'
import { listPublishedExhibits } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import ExhibitCard from '../components/ExhibitCard'
import LoadState from '../components/LoadState'

export function CreatorsPage() {
  const { data, error, loading, reload } = useLoad(listCreators, [])
  return <section className="section">
    <h1>ISM Creators</h1>
    <p className="muted">Нийтлэгдсэн бүтээлтэй оюутан, бүтээгчид.</p>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length} emptyText="Нийтлэгдсэн бүтээлтэй бүтээгч одоогоор алга.">
      <div className="grid">{data?.map((c) => <Link key={c.id} className="card" to={`/creators/${c.id}`}>
        <h3>{c.display_name}</h3>
        <span>{c.exhibits.length} бүтээл →</span>
      </Link>)}</div>
    </LoadState>
  </section>
}

export function CreatorDetailPage() {
  const { id } = useParams()
  const { data, error, loading, reload } = useLoad(async () => {
    const [creator, exhibits] = await Promise.all([getCreator(id), listPublishedExhibits({ creatorId: id })])
    return { creator, exhibits, urls: await signedUrls(exhibits.map((e) => e.image_path)) }
  }, [id])
  const c = data?.creator
  return <section className="section">
    <LoadState loading={loading} error={error} reload={reload} empty={!c} emptyText="Бүтээгч олдсонгүй.">
      {c && <>
        <h1>{c.display_name}</h1>
        {c.bio && <p className="prose">{c.bio}</p>}
        <h2>Бүтээлүүд ({data.exhibits.length})</h2>
        {data.exhibits.length === 0 ? <p className="empty">Нийтлэгдсэн бүтээл алга.</p>
          : <div className="grid">{data.exhibits.map((e) => <ExhibitCard key={e.id} exhibit={e} imageUrl={data.urls[e.image_path]} />)}</div>}
      </>}
    </LoadState>
    <Link to="/creators">← Бүх бүтээгч</Link>
  </section>
}
