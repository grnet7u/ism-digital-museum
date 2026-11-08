import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoad } from '../lib/useLoad'
import { getCreator, updateMyProfile } from '../services/content'
import { t } from '../features/prefs/prefs-context'

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
    if (!name || name.length > 80) return setMessage({ ok: false, text: t('Нэр 1–80 тэмдэгт байна.', 'Name must be 1–80 characters.') })
    if (form.bio.length > 1000) return setMessage({ ok: false, text: t('Танилцуулга 1000 тэмдэгтээс хэтрэхгүй.', 'Bio must be at most 1000 characters.') })
    try { await updateMyProfile(profile.id, form); setMessage({ ok: true, text: t('Профайл хадгаллаа.', 'Profile saved.') }) }
    catch (err) { setMessage({ ok: false, text: err.message }) }
  }
  return <details className="card profile-box">
    <summary>{t('Миний нийтийн профайл (ISM Creators)', 'My public profile (ISM Creators)')}</summary>
    <form className="form" onSubmit={submit} noValidate>
      <label>{t('Нэр', 'Name')}<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={80} /></label>
      <label>{t('Товч танилцуулга', 'Short bio')}<textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={1000} /></label>
      {message && <p className={message.ok ? 'notice' : 'error'} role="status">{message.text}</p>}
      <div className="actions"><button className="button">{t('Хадгалах', 'Save')}</button><Link to={`/creators/${profile.id}`}>{t('Нийтийн профайл үзэх', 'View public profile')}</Link></div>
    </form>
  </details>
}
