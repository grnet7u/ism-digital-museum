import { Link, useParams } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getTeacher, listTeachers } from '../services/content'
import { signedUrls } from '../services/storage'
import LoadState from '../components/LoadState'
import { t } from '../features/prefs/prefs-context'

const Portrait = ({ url, name }) => url
  ? <img className="portrait" src={url} alt={t(`${name} багшийн зураг`, `Photo of ${name}`)} />
  : <div className="portrait img-placeholder" aria-label={t('Зураг хараахан ороогүй', 'No photo yet')}>{t('Зураг ороогүй', 'No photo yet')}</div>
const Draft = ({ show }) => show ? <span className="badge draft">{t('Нийтлээгүй (зөвхөн админд)', 'Unpublished (admin only)')}</span> : null

export function TeachersPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const teachers = await listTeachers()
    return { teachers, urls: await signedUrls(teachers.map((t) => t.photo_path)) }
  }, [])
  return <section className="section">
    <h1>{t('Багш нар', 'Teachers')}</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.teachers.length} emptyText={t('Нийтлэгдсэн багшийн мэдээлэл одоогоор алга.', 'No published teacher profiles yet.')}>
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
  const teacher = data?.teacher
  return <section className="section">
    <LoadState loading={loading} error={error} reload={reload} empty={!teacher} emptyText={t('Багш олдсонгүй.', 'Teacher not found.')}>
      {teacher && <article className="detail teacher-detail">
        <Portrait url={data.urls[teacher.photo_path]} name={teacher.name} />
        <div>
          <Draft show={!teacher.published} />
          <h1>{teacher.name}</h1>
          {teacher.position && <p className="meta">{teacher.position}</p>}
          {teacher.bio && <p className="prose">{teacher.bio}</p>}
          {teacher.courses.length > 0 && <><h2>{t('Заадаг хичээлүүд', 'Courses taught')}</h2><ul>{teacher.courses.map((c) => <li key={c}>{c}</li>)}</ul></>}
          {teacher.source_url && <p className="meta">{t('Эх сурвалж', 'Source')}: <a href={teacher.source_url} target="_blank" rel="noopener noreferrer">{t('СЭЗИС-ийн багшийн профайл', 'UFE staff profile')}</a></p>}
        </div>
      </article>}
    </LoadState>
    <Link to="/teachers">← {t('Бүх багш', 'All teachers')}</Link>
  </section>
}
