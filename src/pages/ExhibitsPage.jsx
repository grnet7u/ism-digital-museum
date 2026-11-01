import { useLoad } from '../lib/useLoad'
import { listPublishedExhibits } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import ExhibitCard from '../components/ExhibitCard'
import LoadState from '../components/LoadState'

async function loadExhibits() {
  const exhibits = await listPublishedExhibits()
  return { exhibits, urls: await signedUrls(exhibits.map((e) => e.image_path)) }
}

export default function ExhibitsPage() {
  const { data, error, loading, reload } = useLoad(loadExhibits, [])
  return <section className="section">
    <h1>Бүтээлүүд</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.exhibits.length} emptyText="Нийтлэгдсэн бүтээл одоогоор алга.">
      <p className="muted">{data?.exhibits.length} бүтээл</p>
      <div className="grid">{data?.exhibits.map((e) => <ExhibitCard key={e.id} exhibit={e} imageUrl={data.urls[e.image_path]} />)}</div>
    </LoadState>
  </section>
}
