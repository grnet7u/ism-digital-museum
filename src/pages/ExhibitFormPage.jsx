import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useLoad } from '../lib/useLoad'
import { getExhibit, listCategories, saveExhibit } from '../services/exhibits'
import { signedUrls } from '../services/storage'
import LoadState from '../components/LoadState'
import { validateExhibit, validateImage } from '../features/exhibits/validate'
import { t } from '../features/prefs/prefs-context'

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
    <h1>{id ? t('Бүтээл засах', 'Edit work') : t('Шинэ бүтээл', 'New work')}</h1>
    <LoadState loading={loading} error={error} reload={reload} empty={notOwn} emptyText={t('Бүтээл олдсонгүй эсвэл таны бүтээл биш.', 'Work not found or not yours.')}>
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
        ? t('Хадгаллаа, гэхдээ хуучин зургийг устгаж чадсангүй.', 'Saved, but the old image could not be removed.') : status === 'draft' ? t('Ноорог хадгаллаа.', 'Draft saved.') : t('Хадгалж, хянуулахаар илгээлээ.', 'Saved and submitted for review.') } })
    } catch (err) {
      setSaveError(`${t('Хадгалж чадсангүй', 'Could not save')}: ${err.message}`)
    } finally { setBusy(false) }
  }

  const field = (name, label, input) => <label>{label}{input}{errors[name] && <span className="field-error" id={`${name}-error`}>{errors[name]}</span>}</label>
  const aria = (name) => ({ name, 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `${name}-error` : undefined })

  return <form className="form" onSubmit={(e) => { e.preventDefault(); submit('pending') }} noValidate>
    {exhibit?.status === 'published' && <p className="notice">{t('Энэ бүтээл нийтлэгдсэн. Засвар хадгалахад дахин админы хяналтад орно.', 'This work is published. Saving changes sends it back to admin review.')}</p>}
    {exhibit?.moderation_note && <p className="note">{t('Админы тэмдэглэл', 'Admin note')}: {exhibit.moderation_note}</p>}
    {field('title', t('Гарчиг *', 'Title *'), <input {...aria('title')} value={form.title} onChange={change} maxLength={150} required />)}
    {field('description', t('Тайлбар', 'Description'), <textarea {...aria('description')} value={form.description} onChange={change} rows={6} maxLength={5000} />)}
    <div className="form-row">
      {field('year_created', t('Он *', 'Year *'), <input {...aria('year_created')} type="number" value={form.year_created} onChange={change} min={1990} required />)}
      {field('category_id', t('Ангилал *', 'Category *'), <select {...aria('category_id')} value={form.category_id} onChange={change} required>
        <option value="">{t('Сонгох…', 'Choose…')}</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>)}
    </div>
    {field('technologies', t('Технологиуд (таслалаар тусгаарла)', 'Technologies (comma-separated)'), <input {...aria('technologies')} value={form.technologies} onChange={change} placeholder="React, Supabase, PostgreSQL" />)}
    {field('demo_url', t('Demo холбоос', 'Demo link'), <input {...aria('demo_url')} type="url" value={form.demo_url} onChange={change} placeholder="https://" />)}
    {field('github_url', t('GitHub холбоос', 'GitHub link'), <input {...aria('github_url')} type="url" value={form.github_url} onChange={change} placeholder="https://github.com/…" />)}
    {field('image', t('Зураг (JPEG/PNG/WebP, 5 MB хүртэл)', 'Image (JPEG/PNG/WebP, up to 5 MB)'), <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] ?? null)} />)}
    {(preview || imageUrl) && <img className="preview" src={preview || imageUrl} alt={t('Сонгосон зургийн урьдчилсан харагдац', 'Preview of the selected image')} />}
    {saveError && <p className="error" role="alert">{saveError}</p>}
    <div className="actions">
      <button className="button" disabled={busy}>{busy ? t('Хадгалж байна…', 'Saving…') : t('Хадгалаад хянуулах', 'Save and submit')}</button>
      <button type="button" className="button secondary-light" disabled={busy} onClick={() => submit('draft')}>{t('Ноорог болгон хадгалах', 'Save as draft')}</button>
      <Link to="/my-works">{t('Болих', 'Cancel')}</Link>
    </div>
  </form>
}
