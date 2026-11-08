import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { formatDate } from '../lib/format'
import { addCategory, deleteContent, getEvent, listEvents, listHistory, listModerationQueue, listTeachers, moderateExhibit, saveContent } from '../services/content'
import { listCategories } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import { STATUS_LABELS, validateImage } from '../features/exhibits/validate'
import LoadState from '../components/LoadState'
import { t } from '../features/prefs/prefs-context'

// Functions, not constants, so labels follow the active language.
const tabs = () => [['moderation', t('Бүтээл хянах', 'Moderation')], ['teachers', t('Багш нар', 'Teachers')], ['events', t('Арга хэмжээ', 'Events')], ['history', t('Түүх', 'History')], ['categories', t('Ангилал', 'Categories')]]

// Field types: text | textarea | number | date | lines (text[] one per line) | checkbox | image
const configs = () => ({
  teachers: { table: 'teachers', folder: 'teachers', imageField: 'photo_path', list: listTeachers, label: (teacher) => teacher.name, fields: [
    ['name', t('Нэр *', 'Name *'), 'text', true], ['position', t('Албан тушаал', 'Position'), 'text'], ['courses', t('Хичээлүүд (мөр бүрд нэг)', 'Courses (one per line)'), 'lines'],
    ['name_en', t('Нэр (англи)', 'Name (English)'), 'text'], ['position_en', t('Албан тушаал (англи)', 'Position (English)'), 'text'], ['courses_en', t('Хичээлүүд (англи, мөр бүрд нэг)', 'Courses (English, one per line)'), 'lines'],
    ['bio', t('Танилцуулга', 'Bio'), 'textarea'], ['bio_en', t('Танилцуулга (англи)', 'Bio (English)'), 'textarea'], ['source_url', t('Эх сурвалжийн холбоос', 'Source link'), 'text'], ['sort_order', t('Дараалал', 'Order'), 'number'],
    ['photo_path', t('Зураг', 'Photo'), 'image'], ['published', t('Нийтлэх', 'Publish'), 'checkbox']] },
  events: { table: 'events', folder: 'events', imageField: 'cover_image_path', list: listEvents, label: (e) => `${e.title} · ${formatDate(e.event_date)}`, fields: [
    ['title', t('Нэр *', 'Title *'), 'text', true], ['event_date', t('Огноо *', 'Date *'), 'date', true], ['description', t('Тайлбар', 'Description'), 'textarea'],
    ['cover_image_path', t('Нүүр зураг', 'Cover image'), 'image'], ['published', t('Нийтлэх', 'Publish'), 'checkbox']] },
  history: { table: 'history_entries', folder: 'history', list: listHistory, label: (h) => `${h.year} · ${h.title}`, fields: [
    ['year', t('Он *', 'Year *'), 'number', true], ['title', t('Гарчиг *', 'Title *'), 'text', true], ['description', t('Тайлбар', 'Description'), 'textarea'],
    ['source_url', t('Эх сурвалжийн холбоос', 'Source link'), 'text'], ['published', t('Нийтлэх', 'Publish'), 'checkbox']] },
})

export default function AdminPage() {
  const [tab, setTab] = useState('moderation')
  return <section className="section">
    <h1>{t('Админ', 'Admin')}</h1>
    <div className="tabs" role="tablist">{tabs().map(([key, label]) =>
      <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
    <div role="tabpanel">
      {tab === 'moderation' && <Moderation />}
      {configs()[tab] && <ContentAdmin key={tab} config={configs()[tab]} />}
      {tab === 'categories' && <Categories />}
    </div>
  </section>
}

function Feedback({ message }) {
  return message ? <p className={message.ok ? 'notice' : 'error'} role="status">{message.text}</p> : null
}

function Moderation() {
  const { data, error, loading, reload } = useLoad(listModerationQueue, [])
  const [notes, setNotes] = useState({})
  const [message, setMessage] = useState(null)
  async function act(e, status, label) {
    try { await moderateExhibit(e.id, status, status === 'published' ? null : notes[e.id]); setMessage({ ok: true, text: `"${e.title}" — ${label}` }); reload() }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  return <>
    <Feedback message={message} />
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length} emptyText={t('Хянах бүтээл алга.', 'Nothing to review.')}>
      <ul className="admin-list">{data?.map((e) => <li key={e.id}>
        <div><span className={`badge ${e.status}`}>{STATUS_LABELS[e.status]}</span> <Link to={`/exhibits/${e.id}`}>{e.title}</Link> <span className="meta">· {e.creator?.display_name} · {e.year_created}</span></div>
        <label className="inline-field">{t('Тэмдэглэл (буцаах үед)', 'Note (when returning)')}<input value={notes[e.id] ?? ''} onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })} /></label>
        <div className="card-actions">
          {e.status === 'pending' && <button className="button" onClick={() => act(e, 'published', t('нийтлэгдлээ', 'published'))}>{t('Нийтлэх', 'Publish')}</button>}
          <button className="button secondary-light" onClick={() => act(e, 'draft', t('ноорог руу буцаагдлаа', 'returned to draft'))}>{e.status === 'published' ? t('Нийтлэлээс хасах', 'Unpublish') : t('Засвар шаардах', 'Request changes')}</button>
        </div>
      </li>)}</ul>
    </LoadState>
  </>
}

const emptyRow = (fields) => Object.fromEntries(fields.map(([name, , type]) => [name, type === 'checkbox' ? false : type === 'lines' ? [] : '']))

function ContentAdmin({ config }) {
  const { data, error, loading, reload } = useLoad(config.list, [config.table])
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState(null)
  const done = (text) => { setMessage({ ok: true, text }); setEditing(null); reload() }
  async function remove(row) {
    const paths = config.imageField ? [row[config.imageField]] : []
    if (config.table === 'events') paths.push(...((await getEvent(row.id))?.photos ?? []).map((p) => p.image_path))
    try { const { cleanupFailed } = await deleteContent(config.table, row.id, paths); done(cleanupFailed ? t('Устгасан, гэхдээ зарим файл үлдсэн.', 'Deleted, but some files remain.') : t('Устгалаа.', 'Deleted.')) }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  if (editing) return <>
    <ContentForm config={config} row={editing} onSaved={() => done(t('Хадгаллаа.', 'Saved.'))} onCancel={() => setEditing(null)} />
    {config.table === 'events' && editing.id && <Album eventId={editing.id} />}
  </>
  return <>
    <Feedback message={message} />
    <button className="button" onClick={() => setEditing(emptyRow(config.fields))}>+ {t('Шинээр нэмэх', 'Add new')}</button>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length} emptyText={t('Бичлэг алга.', 'No records.')}>
      <ul className="admin-list">{data?.map((row) => <li key={row.id}>
        <div><span className={`badge ${row.published ? 'published' : 'draft'}`}>{row.published ? t('Нийтлэгдсэн', 'Published') : t('Нийтлээгүй', 'Unpublished')}</span> {config.label(row)}</div>
        <ConfirmActions onEdit={() => setEditing(row)} onDelete={() => remove(row)} />
      </li>)}</ul>
    </LoadState>
  </>
}

function ConfirmActions({ onEdit, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  return <div className="card-actions">
    {onEdit && <button className="link-button" onClick={onEdit}>{t('Засах', 'Edit')}</button>}
    {confirm ? <span>{t('Буцаах боломжгүй.', 'This cannot be undone.')} <button className="link-button danger" onClick={onDelete}>{t('Тийм, устгах', 'Yes, delete')}</button> <button className="link-button" onClick={() => setConfirm(false)}>{t('Болих', 'Cancel')}</button></span>
      : <button className="link-button danger" onClick={() => setConfirm(true)}>{t('Устгах', 'Delete')}</button>}
  </div>
}

function ContentForm({ config, row, onSaved, onCancel }) {
  const [form, setForm] = useState(() => ({ ...row, ...Object.fromEntries(config.fields
    .filter(([, , type]) => type === 'lines').map(([name]) => [name, (row[name] ?? []).join('\n')])) }))
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    const missing = config.fields.find(([name, , , required]) => required && !String(form[name] ?? '').trim())
    const problem = missing ? `${missing[1].replace(' *', '')}: ${t('заавал', 'required')}.` : validateImage(file)
    setError(problem)
    if (problem) return
    const values = {}
    for (const [name, , type] of config.fields) {
      if (type === 'image') continue
      const v = form[name]
      if (type === 'lines') values[name] = (v ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
      else if (type === 'number') values[name] = Number(v) || 0
      else if (type === 'checkbox') values[name] = Boolean(v)
      else if (type === 'textarea') values[name] = (v ?? '').trim() // NOT NULL columns default to ''
      else values[name] = (v ?? '').trim() || null
    }
    if (config.imageField) values[config.imageField] = row[config.imageField] || null
    setBusy(true)
    try { await saveContent(config.table, { id: row.id, ...values }, { file, folder: config.folder, imageField: config.imageField }); onSaved() }
    catch (err) { setError(`${t('Хадгалж чадсангүй', 'Could not save')}: ${err.message}`) }
    finally { setBusy(false) }
  }
  const set = (name, value) => setForm({ ...form, [name]: value })
  return <form className="form narrow-wide" onSubmit={submit} noValidate>
    <h2>{row.id ? t('Засах', 'Edit') : t('Шинэ бичлэг', 'New record')}</h2>
    {config.fields.map(([name, label, type]) => {
      if (type === 'checkbox') return <label key={name} className="check"><input type="checkbox" checked={Boolean(form[name])} onChange={(e) => set(name, e.target.checked)} /> {label}</label>
      if (type === 'image') return <label key={name}>{label} (JPEG/PNG/WebP, 5 MB){row[name] && t(' — одоо зурагтай', ' — has an image')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] ?? null)} /></label>
      const props = { value: form[name] ?? '', onChange: (e) => set(name, e.target.value) }
      return <label key={name}>{label}{type === 'textarea' || type === 'lines' ? <textarea rows={type === 'lines' ? 5 : 6} {...props} /> : <input type={type} {...props} />}</label>
    })}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="actions"><button className="button" disabled={busy}>{busy ? t('Хадгалж байна…', 'Saving…') : t('Хадгалах', 'Save')}</button><button type="button" className="button secondary-light" onClick={onCancel}>{t('Болих', 'Cancel')}</button></div>
  </form>
}

function Album({ eventId }) {
  const { data, error, loading, reload } = useLoad(async () => {
    const event = await getEvent(eventId)
    return { photos: event?.photos ?? [], urls: await signedUrls((event?.photos ?? []).map((p) => p.image_path)) }
  }, [eventId])
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [message, setMessage] = useState(null)
  async function add(event) {
    event.preventDefault()
    const problem = file ? validateImage(file) : t('Зураг сонгоно уу.', 'Choose an image.')
    if (problem) return setMessage({ ok: false, text: problem })
    try {
      await saveContent('event_photos', { event_id: eventId, caption: caption.trim(), sort_order: data.photos.length, image_path: null },
        { file, folder: `events/${eventId}`, imageField: 'image_path' })
      setFile(null); setCaption(''); event.target.reset(); setMessage({ ok: true, text: t('Зураг нэмлээ.', 'Image added.') }); reload()
    } catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  async function remove(photo) {
    try { await deleteContent('event_photos', photo.id, [photo.image_path]); reload() }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  return <section className="album-admin">
    <h2>{t('Зурагт цомог', 'Photo album')}</h2>
    <Feedback message={message} />
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.photos.length} emptyText={t('Цомогт зураг алга.', 'No photos in the album.')}>
      <div className="album">{data?.photos.map((p) => <figure key={p.id}>
        {data.urls[p.image_path] && <img src={data.urls[p.image_path]} alt={p.caption} />}
        <figcaption>{p.caption || '—'}</figcaption>
        <ConfirmActions onDelete={() => remove(p)} />
      </figure>)}</div>
    </LoadState>
    <form className="form" onSubmit={add}>
      <label>{t('Зураг', 'Image')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] ?? null)} /></label>
      <label>{t('Тайлбар', 'Caption')}<input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} /></label>
      <button className="button">{t('Цомогт нэмэх', 'Add to album')}</button>
    </form>
  </section>
}

function Categories() {
  const { data, error, loading, reload } = useLoad(listCategories, [])
  const [name, setName] = useState('')
  const [message, setMessage] = useState(null)
  async function add(event) {
    event.preventDefault()
    if (!name.trim()) return setMessage({ ok: false, text: t('Нэр заавал.', 'Name is required.') })
    try { await addCategory(name, ''); setName(''); setMessage({ ok: true, text: t('Ангилал нэмлээ.', 'Category added.') }); reload() }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  async function remove(c) {
    try { await deleteContent('exhibition_categories', c.id); setMessage({ ok: true, text: t('Устгалаа.', 'Deleted.') }); reload() }
    catch (err) { setMessage({ ok: false, text: err.code === '23503' ? t('Энэ ангилалд бүтээл байгаа тул устгах боломжгүй.', 'This category still has works, so it cannot be deleted.') : err.message }) }
  }
  return <>
    <Feedback message={message} />
    <form className="form inline-form" onSubmit={add}><label>{t('Шинэ ангилал', 'New category')}<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label><button className="button">{t('Нэмэх', 'Add')}</button></form>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length}>
      <ul className="admin-list">{data?.map((c) => <li key={c.id}><div>{c.name}</div><ConfirmActions onDelete={() => remove(c)} /></li>)}</ul>
    </LoadState>
  </>
}
