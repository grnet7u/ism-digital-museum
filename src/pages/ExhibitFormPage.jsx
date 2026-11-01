import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useLoad } from '../lib/useLoad'
import { getExhibit, listCategories, saveExhibit } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import LoadState from '../components/LoadState'
import { validateExhibit, validateImage } from '../features/exhibits/validate'

const emptyForm = { title: '', description: '', year_created: String(new Date().getFullYear()), category_id: '', technologies: '', demo_url: '', github_url: '' }
const toForm = (e) => ({ title: e.title, description: e.description, year_created: String(e.year_created ?? ''), category_id: e.category_id ?? '',
  technologies: e.technology_stack.join(', '), demo_url: e.demo_url ?? '', github_url: e.github_url ?? '' })

export default function ExhibitFormPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, error, loading, reload } = useLoad(async () => {
    const [categories, exhibit] = await Promise.all([listCategories(), id ? getExhibit(id) : null])
    const urls = exhibit ? await signedUrls([exhibit.image_path]) : {}
    return { categories, exhibit, imageUrl: exhibit && urls[exhibit.image_path] }
  }, [id])
  // Only the owner edits here; RLS rejects other users anyway.
  const notOwn = id && data && data.exhibit?.creator_id !== user.id
  return <section className="section narrow-wide">
    <h1>{id ? 'Бүтээл засах' : 'Шинэ бүтээл'}</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={notOwn} emptyText="Бүтээл олдсонгүй эсвэл таны бүтээл биш.">
      {data && !notOwn && <ExhibitForm key={id ?? 'new'} {...data} userId={user.id} />}
    </LoadState>
  </section>
}

function ExhibitForm({ categories, exhibit, imageUrl, userId }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(exhibit ? toForm(exhibit) : emptyForm)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [busy, setBusy] = useState(false)

  const preview = useMemo(() => file && URL.createObjectURL(file), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(status) {
    const found = validateExhibit(form)
    const imageError = validateImage(file)
    if (imageError) found.image = imageError
    setErrors(found); setSaveError('')
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      const { cleanupFailed } = await saveExhibit({ id: exhibit?.id, userId, form, file, oldImagePath: exhibit?.image_path, status })
      navigate('/my-works', { replace: true, state: { notice: cleanupFailed
        ? 'Хадгаллаа, гэхдээ хуучин зургийг устгаж чадсангүй.' : status === 'draft' ? 'Ноорог хадгаллаа.' : 'Хадгалж, хянуулахаар илгээлээ.' } })
    } catch (err) {
      setSaveError(`Хадгалж чадсангүй: ${err.message}`)
    } finally { setBusy(false) }
  }

  const field = (name, label, input) => <label>{label}{input}{errors[name] && <span className="field-error" id={`${name}-error`}>{errors[name]}</span>}</label>
  const aria = (name) => ({ name, 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `${name}-error` : undefined })

  return <form className="form" onSubmit={(e) => { e.preventDefault(); submit('pending') }} noValidate>
    {exhibit?.status === 'published' && <p className="notice">Энэ бүтээл нийтлэгдсэн. Засвар хадгалахад дахин админы хяналтад орно.</p>}
    {exhibit?.moderation_note && <p className="note">Админы тэмдэглэл: {exhibit.moderation_note}</p>}
    {field('title', 'Гарчиг *', <input {...aria('title')} value={form.title} onChange={change} maxLength={150} required />)}
    {field('description', 'Тайлбар', <textarea {...aria('description')} value={form.description} onChange={change} rows={6} maxLength={5000} />)}
    <div className="form-row">
      {field('year_created', 'Он *', <input {...aria('year_created')} type="number" value={form.year_created} onChange={change} min={1990} required />)}
      {field('category_id', 'Ангилал *', <select {...aria('category_id')} value={form.category_id} onChange={change} required>
        <option value="">Сонгох…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>)}
    </div>
    {field('technologies', 'Технологиуд (таслалаар тусгаарла)', <input {...aria('technologies')} value={form.technologies} onChange={change} placeholder="React, Supabase, PostgreSQL" />)}
    {field('demo_url', 'Demo холбоос', <input {...aria('demo_url')} type="url" value={form.demo_url} onChange={change} placeholder="https://" />)}
    {field('github_url', 'GitHub холбоос', <input {...aria('github_url')} type="url" value={form.github_url} onChange={change} placeholder="https://github.com/…" />)}
    {field('image', 'Зураг (JPEG/PNG/WebP, 5 MB хүртэл)', <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] ?? null)} />)}
    {(preview || imageUrl) && <img className="preview" src={preview || imageUrl} alt="Сонгосон зургийн урьдчилсан харагдац" />}
    {saveError && <p className="error" role="alert">{saveError}</p>}
    <div className="actions">
      <button className="button" disabled={busy}>{busy ? 'Хадгалж байна…' : 'Хадгалаад хянуулах'}</button>
      <button type="button" className="button secondary-light" disabled={busy} onClick={() => submit('draft')}>Ноорог болгон хадгалах</button>
      <Link to="/my-works">Болих</Link>
    </div>
  </form>
}
