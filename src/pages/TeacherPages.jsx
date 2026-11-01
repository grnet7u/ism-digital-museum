import { Link, useParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getTeacher, listTeachers } from '../services/content'
import { signedUrls } from '../services/storage'
import LoadState from '../components/LoadState'

const Portrait = ({ url, name }) => url
  ? <img className="portrait" src={url} alt={`${name} багшийн зураг`} />
  : <div className="portrait img-placeholder" aria-label="Зураг хараахан ороогүй">Зураг ороогүй</div>
const Draft = ({ show }) => show ? <span className="badge draft">Нийтлээгүй (зөвхөн админд)</span> : null

export function TeachersPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const teachers = await listTeachers()
    return { teachers, urls: await signedUrls(teachers.map((t) => t.photo_path)) }
  }, [])
  return <section className="section">
    <h1>Багш нар</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.teachers.length} emptyText="Нийтлэгдсэн багшийн мэдээлэл одоогоор алга.">
      <div className="grid">{data?.teachers.map((t) => <article key={t.id} className="card teacher-card">
        <Portrait url={data.urls[t.photo_path]} name={t.name} />
        <Draft show={!t.published} />
        <h3><Link to={`/teachers/${t.id}`}>{t.name}</Link></h3>
        {t.position && <p className="meta">{t.position}</p>}
      </article>)}</div>
    </LoadState>
  </section>
}

export function TeacherDetailPage() {
  const { id } = useParams()
  const { data, error, loading, reload } = useLoad(async () => {
    const teacher = await getTeacher(id)
    return { teacher, urls: teacher ? await signedUrls([teacher.photo_path]) : {} }
  }, [id])
  const t = data?.teacher
  return <section className="section">
    <LoadState loading={loading} error={error} reload={reload} empty={!t} emptyText="Багш олдсонгүй.">
      {t && <article className="detail teacher-detail">
        <Portrait url={data.urls[t.photo_path]} name={t.name} />
        <div>
          <Draft show={!t.published} />
          <h1>{t.name}</h1>
          {t.position && <p className="meta">{t.position}</p>}
          {t.bio && <p className="prose">{t.bio}</p>}
          {t.courses.length > 0 && <><h2>Заадаг хичээлүүд</h2><ul>{t.courses.map((c) => <li key={c}>{c}</li>)}</ul></>}
          {t.source_url && <p className="meta">Эх сурвалж: <a href={t.source_url} target="_blank" rel="noopener noreferrer">СЭЗИС-ийн багшийн профайл</a></p>}
        </div>
      </article>}
    </LoadState>
    <Link to="/teachers">← Бүх багш</Link>
  </section>
}
