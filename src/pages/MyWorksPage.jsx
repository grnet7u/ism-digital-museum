import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useLoad } from '../lib/useLoad'
import { deleteExhibit, listMyExhibits, setExhibitStatus } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import ExhibitCard from '../components/ExhibitCard'
import LoadState from '../components/LoadState'
import ProfileForm from '../components/ProfileForm'

export default function MyWorksPage() {
  const { user } = useAuth()
  const notice = useLocation().state?.notice
  const [message, setMessage] = useState(notice ? { ok: true, text: notice } : null)
  const { data, error, loading, reload } = useLoad(async () => {
    const exhibits = await listMyExhibits(user.id)
    return { exhibits, urls: await signedUrls(exhibits.map((e) => e.image_path)) }
  }, [user.id])

  async function run(action, success) {
    setMessage(null)
    try { setMessage({ ok: true, text: await action() ?? success }); reload() }
    catch (err) { setMessage({ ok: false, text: `Амжилтгүй: ${err.message}` }) }
  }
  const [confirmId, setConfirmId] = useState(null)
  const remove = (exhibit) => {
    setConfirmId(null)
    run(async () => (await deleteExhibit(exhibit)).cleanupFailed
      ? 'Бүтээл устсан, гэхдээ зургийн файлыг устгаж чадсангүй.' : null, 'Бүтээл устлаа.')
  }

  return <section className="section">
    <div className="page-head"><h1>Миний бүтээл</h1><Link className="button" to="/my-works/new">+ Шинэ бүтээл</Link></div>
    <ProfileForm userId={user.id} />
    {message && <p className={message.ok ? 'notice' : 'error'} role="status">{message.text}</p>}
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.exhibits.length} emptyText="Та одоогоор бүтээл нэмээгүй байна.">
      <div className="grid">{data?.exhibits.map((e) => <ExhibitCard key={e.id} exhibit={e} imageUrl={data.urls[e.image_path]} showStatus>
        {e.moderation_note && <p className="note">Админы тэмдэглэл: {e.moderation_note}</p>}
        <div className="card-actions">
          <Link to={`/my-works/${e.id}/edit`}>Засах</Link>
          {e.status === 'draft' && <button className="link-button" onClick={() => run(() => setExhibitStatus(e.id, 'pending').then(() => null), 'Хянуулахаар илгээлээ.')}>Хянуулахаар илгээх</button>}
          {confirmId === e.id
            ? <span role="group" aria-label="Устгахыг батлах">Буцаах боломжгүй. <button className="link-button danger" onClick={() => remove(e)}>Тийм, устгах</button> <button className="link-button" onClick={() => setConfirmId(null)}>Болих</button></span>
            : <button className="link-button danger" onClick={() => setConfirmId(e.id)}>Устгах</button>}
        </div>
      </ExhibitCard>)}</div>
    </LoadState>
  </section>
}
