import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { formatDate } from '../lib/format'
import { addCategory, deleteContent, getEvent, listEvents, listHistory, listModerationQueue, listTeachers, moderateExhibit, saveContent } from '../services/content'
import { listCategories } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import { STATUS_LABELS, validateImage } from '../features/exhibits/validate'
import LoadState from '../components/LoadState'

const tabs = [['moderation', 'Бүтээл хянах'], ['teachers', 'Багш нар'], ['events', 'Арга хэмжээ'], ['history', 'Түүх'], ['categories', 'Ангилал']]

// Field types: text | textarea | number | date | lines (text[] one per line) | checkbox | image
const configs = {
  teachers: { table: 'teachers', folder: 'teachers', imageField: 'photo_path', list: listTeachers, label: (t) => t.name, fields: [
    ['name', 'Нэр *', 'text', true], ['position', 'Албан тушаал', 'text'], ['courses', 'Хичээлүүд (мөр бүрд нэг)', 'lines'],
    ['bio', 'Танилцуулга', 'textarea'], ['source_url', 'Эх сурвалжийн холбоос', 'text'], ['sort_order', 'Дараалал', 'number'],
    ['photo_path', 'Зураг', 'image'], ['published', 'Нийтлэх', 'checkbox']] },
  events: { table: 'events', folder: 'events', imageField: 'cover_image_path', list: listEvents, label: (e) => `${e.title} · ${formatDate(e.event_date)}`, fields: [
    ['title', 'Нэр *', 'text', true], ['event_date', 'Огноо *', 'date', true], ['description', 'Тайлбар', 'textarea'],
    ['cover_image_path', 'Нүүр зураг', 'image'], ['published', 'Нийтлэх', 'checkbox']] },
  history: { table: 'history_entries', folder: 'history', list: listHistory, label: (h) => `${h.year} · ${h.title}`, fields: [
    ['year', 'Он *', 'number', true], ['title', 'Гарчиг *', 'text', true], ['description', 'Тайлбар', 'textarea'],
    ['source_url', 'Эх сурвалжийн холбоос', 'text'], ['published', 'Нийтлэх', 'checkbox']] },
}

export default function AdminPage() {
  const [tab, setTab] = useState('moderation')
  return <section className="section">
    <h1>Админ</h1>
    <div className="tabs" role="tablist">{tabs.map(([key, label]) =>
      <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
    <div role="tabpanel">
      {tab === 'moderation' && <Moderation />}
      {configs[tab] && <ContentAdmin key={tab} config={configs[tab]} />}
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
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length} emptyText="Хянах бүтээл алга.">
      <ul className="admin-list">{data?.map((e) => <li key={e.id}>
        <div><span className={`badge ${e.status}`}>{STATUS_LABELS[e.status]}</span> <Link to={`/exhibits/${e.id}`}>{e.title}</Link> <span className="meta">· {e.creator?.display_name} · {e.year_created}</span></div>
        <label className="inline-field">Тэмдэглэл (буцаах үед)<input value={notes[e.id] ?? ''} onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })} /></label>
        <div className="card-actions">
          {e.status === 'pending' && <button className="button" onClick={() => act(e, 'published', 'нийтлэгдлээ')}>Нийтлэх</button>}
          <button className="button secondary-light" onClick={() => act(e, 'draft', 'ноорог руу буцаагдлаа')}>{e.status === 'published' ? 'Нийтлэлээс хасах' : 'Засвар шаардах'}</button>
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
    try { const { cleanupFailed } = await deleteContent(config.table, row.id, paths); done(cleanupFailed ? 'Устгасан, гэхдээ зарим файл үлдсэн.' : 'Устгалаа.') }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  if (editing) return <>
    <ContentForm config={config} row={editing} onSaved={() => done('Хадгаллаа.')} onCancel={() => setEditing(null)} />
    {config.table === 'events' && editing.id && <Album eventId={editing.id} />}
  </>
  return <>
    <Feedback message={message} />
    <button className="button" onClick={() => setEditing(emptyRow(config.fields))}>+ Шинээр нэмэх</button>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length} emptyText="Бичлэг алга.">
      <ul className="admin-list">{data?.map((row) => <li key={row.id}>
        <div><span className={`badge ${row.published ? 'published' : 'draft'}`}>{row.published ? 'Нийтлэгдсэн' : 'Нийтлээгүй'}</span> {config.label(row)}</div>
        <ConfirmActions onEdit={() => setEditing(row)} onDelete={() => remove(row)} />
      </li>)}</ul>
    </LoadState>
  </>
}

function ConfirmActions({ onEdit, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  return <div className="card-actions">
    {onEdit && <button className="link-button" onClick={onEdit}>Засах</button>}
    {confirm ? <span>Буцаах боломжгүй. <button className="link-button danger" onClick={onDelete}>Тийм, устгах</button> <button className="link-button" onClick={() => setConfirm(false)}>Болих</button></span>
      : <button className="link-button danger" onClick={() => setConfirm(true)}>Устгах</button>}
  </div>
}

function ContentForm({ config, row, onSaved, onCancel }) {
  const [form, setForm] = useState({ ...row, courses: row.courses?.join('\n') })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    const missing = config.fields.find(([name, , , required]) => required && !String(form[name] ?? '').trim())
    const problem = missing ? `${missing[1].replace(' *', '')} заавал.` : validateImage(file)
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
    catch (err) { setError(`Хадгалж чадсангүй: ${err.message}`) }
    finally { setBusy(false) }
  }
  const set = (name, value) => setForm({ ...form, [name]: value })
  return <form className="form narrow-wide" onSubmit={submit} noValidate>
    <h2>{row.id ? 'Засах' : 'Шинэ бичлэг'}</h2>
    {config.fields.map(([name, label, type]) => {
      if (type === 'checkbox') return <label key={name} className="check"><input type="checkbox" checked={Boolean(form[name])} onChange={(e) => set(name, e.target.checked)} /> {label}</label>
      if (type === 'image') return <label key={name}>{label} (JPEG/PNG/WebP, 5 MB){row[name] && ' — одоо зурагтай'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] ?? null)} /></label>
      const props = { value: form[name] ?? '', onChange: (e) => set(name, e.target.value) }
      return <label key={name}>{label}{type === 'textarea' || type === 'lines' ? <textarea rows={type === 'lines' ? 5 : 6} {...props} /> : <input type={type} {...props} />}</label>
    })}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="actions"><button className="button" disabled={busy}>{busy ? 'Хадгалж байна…' : 'Хадгалах'}</button><button type="button" className="button secondary-light" onClick={onCancel}>Болих</button></div>
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
    const problem = file ? validateImage(file) : 'Зураг сонгоно уу.'
    if (problem) return setMessage({ ok: false, text: problem })
    try {
      await saveContent('event_photos', { event_id: eventId, caption: caption.trim(), sort_order: data.photos.length, image_path: null },
        { file, folder: `events/${eventId}`, imageField: 'image_path' })
      setFile(null); setCaption(''); event.target.reset(); setMessage({ ok: true, text: 'Зураг нэмлээ.' }); reload()
    } catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  async function remove(photo) {
    try { await deleteContent('event_photos', photo.id, [photo.image_path]); reload() }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  return <section className="album-admin">
    <h2>Зурагт цомог</h2>
    <Feedback message={message} />
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.photos.length} emptyText="Цомогт зураг алга.">
      <div className="album">{data?.photos.map((p) => <figure key={p.id}>
        {data.urls[p.image_path] && <img src={data.urls[p.image_path]} alt={p.caption} />}
        <figcaption>{p.caption || '—'}</figcaption>
        <ConfirmActions onDelete={() => remove(p)} />
      </figure>)}</div>
    </LoadState>
    <form className="form" onSubmit={add}>
      <label>Зураг<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] ?? null)} /></label>
      <label>Тайлбар<input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} /></label>
      <button className="button">Цомогт нэмэх</button>
    </form>
  </section>
}

function Categories() {
  const { data, error, loading, reload } = useLoad(listCategories, [])
  const [name, setName] = useState('')
  const [message, setMessage] = useState(null)
  async function add(event) {
    event.preventDefault()
    if (!name.trim()) return setMessage({ ok: false, text: 'Нэр заавал.' })
    try { await addCategory(name, ''); setName(''); setMessage({ ok: true, text: 'Ангилал нэмлээ.' }); reload() }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  async function remove(c) {
    try { await deleteContent('exhibition_categories', c.id); setMessage({ ok: true, text: 'Устгалаа.' }); reload() }
    catch (err) { setMessage({ ok: false, text: err.code === '23503' ? 'Энэ ангилалд бүтээл байгаа тул устгах боломжгүй.' : err.message }) }
  }
  return <>
    <Feedback message={message} />
    <form className="form inline-form" onSubmit={add}><label>Шинэ ангилал<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label><button className="button">Нэмэх</button></form>
    <LoadState loading={loading} error={error} reload={reload} empty={!data?.length}>
      <ul className="admin-list">{data?.map((c) => <li key={c.id}><div>{c.name}</div><ConfirmActions onDelete={() => remove(c)} /></li>)}</ul>
    </LoadState>
  </>
}
