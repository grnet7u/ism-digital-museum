import { useLoad } from '../lib/useLoad'
import { listHistory } from '../services/content'
import LoadState from '../components/LoadState'
import { t } from '../features/prefs/prefs-context'

export default function HistoryPage() {
  const { data, error, loading, reload } = useLoad(listHistory, [])
  return <section className="section">
    <h1>{t('Тэнхимийн түүх', 'Department history')}</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length} emptyText={t('Баталгаажсан түүхэн мэдээлэл одоогоор ороогүй байна.', 'No verified history entries yet.')}>
      <ol className="timeline">{data?.map((h) => <li key={h.id}>
        <span className="year">{h.year}</span>
        <div>
          {!h.published && <span className="badge draft">{t('Нийтлээгүй', 'Unpublished')}</span>}
          <h3>{h.title}</h3>
          {h.description && <p className="prose">{h.description}</p>}
          {h.source_url && <p className="meta"><a href={h.source_url} target="_blank" rel="noopener noreferrer">{t('Эх сурвалж', 'Source')}</a></p>}
        </div>
      </li>)}</ol>
    </LoadState>
  </section>
}
