import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useLoad } from '../lib/useLoad'
import { deleteExhibit, listMyExhibits, setExhibitStatus } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import ExhibitCard from '../components/ExhibitCard'
import LoadState from '../components/LoadState'
import ProfileForm from '../components/ProfileForm'
import { t } from '../features/prefs/prefs-context'

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
    catch (err) { setMessage({ ok: false, text: `${t('Амжилтгүй', 'Failed')}: ${err.message}` }) }
  }
  const [confirmId, setConfirmId] = useState(null)
  const remove = (exhibit) => {
    setConfirmId(null)
    run(async () => (await deleteExhibit(exhibit)).cleanupFailed
      ? t('Бүтээл устсан, гэхдээ зургийн файлыг устгаж чадсангүй.', 'Work deleted, but the image file could not be removed.') : null, t('Бүтээл устлаа.', 'Work deleted.'))
  }

  return <section className="section">
    <div className="page-head"><h1>{t('Миний бүтээл', 'My works')}</h1><Link className="button" to="/my-works/new">+ {t('Шинэ бүтээл', 'New work')}</Link></div>
    <ProfileForm userId={user.id} />
    {message && <p className={message.ok ? 'notice' : 'error'} role="status">{message.text}</p>}
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.exhibits.length} emptyText={t('Та одоогоор бүтээл нэмээгүй байна.', 'You have not added any works yet.')}>
      <div className="grid">{data?.exhibits.map((e) => <ExhibitCard key={e.id} exhibit={e} imageUrl={data.urls[e.image_path]} showStatus>
        {e.moderation_note && <p className="note">{t('Админы тэмдэглэл', 'Admin note')}: {e.moderation_note}</p>}
        <div className="card-actions">
          <Link to={`/my-works/${e.id}/edit`}>{t('Засах', 'Edit')}</Link>
          {e.status === 'draft' && <button className="link-button" onClick={() => run(() => setExhibitStatus(e.id, 'pending').then(() => null), t('Хянуулахаар илгээлээ.', 'Submitted for review.'))}>{t('Хянуулахаар илгээх', 'Submit for review')}</button>}
          {confirmId === e.id
            ? <span role="group" aria-label={t('Устгахыг батлах', 'Confirm delete')}>{t('Буцаах боломжгүй.', 'This cannot be undone.')} <button className="link-button danger" onClick={() => remove(e)}>{t('Тийм, устгах', 'Yes, delete')}</button> <button className="link-button" onClick={() => setConfirmId(null)}>{t('Болих', 'Cancel')}</button></span>
            : <button className="link-button danger" onClick={() => setConfirmId(e.id)}>{t('Устгах', 'Delete')}</button>}
        </div>
      </ExhibitCard>)}</div>
    </LoadState>
  </section>
}
