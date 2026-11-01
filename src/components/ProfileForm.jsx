import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getCreator, updateMyProfile } from '../services/content'

/** Public creator profile (display name + bio). Only this user's own row is writable (RLS). */
export default function ProfileForm({ userId }) {
  const { data } = useLoad(() => getCreator(userId), [userId])
  return data ? <Editor key={data.id} profile={data} /> : null
}

function Editor({ profile }) {
  const [form, setForm] = useState({ display_name: profile.display_name, bio: profile.bio })
  const [message, setMessage] = useState(null)
  async function submit(event) {
    event.preventDefault()
    const name = form.display_name.trim()
    if (!name || name.length > 80) return setMessage({ ok: false, text: 'Нэр 1–80 тэмдэгт байна.' })
    if (form.bio.length > 1000) return setMessage({ ok: false, text: 'Танилцуулга 1000 тэмдэгтээс хэтрэхгүй.' })
    try { await updateMyProfile(profile.id, form); setMessage({ ok: true, text: 'Профайл хадгаллаа.' }) }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  return <details className="card profile-box">
    <summary>Миний нийтийн профайл (ISM Creators)</summary>
    <form className="form" onSubmit={submit} noValidate>
      <label>Нэр<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={80} /></label>
      <label>Товч танилцуулга<textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={1000} /></label>
      {message && <p className={message.ok ? 'notice' : 'error'} role="status">{message.text}</p>}
      <div className="actions"><button className="button">Хадгалах</button><Link to={`/creators/${profile.id}`}>Нийтийн профайл үзэх</Link></div>
    </form>
  </details>
}
