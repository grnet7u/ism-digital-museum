import { supabase } from '../lib/supabase'
import { parseTechnologies } from '../features/exhibits/validate'
import { removeImages, uploadImage } from './storage'

const FIELDS = '*, category:exhibition_categories(id, name), creator:profiles(id, display_name)'

const check = ({ data, error }) => { if (error) throw error; return data }

export const listCategories = async () =>
  check(await supabase.from('exhibition_categories').select('id, name').order('name'))

export async function listPublishedExhibits({ creatorId } = {}) {
  let query = supabase.from('exhibits').select(FIELDS).eq('status', 'published').order('year_created', { ascending: false })
  if (creatorId) query = query.eq('creator_id', creatorId)
  return check(await query)
}

export const listMyExhibits = async (userId) =>
  check(await supabase.from('exhibits').select(FIELDS).eq('creator_id', userId).order('updated_at', { ascending: false }))

/** null when the row does not exist OR the user may not see it (RLS hides both the same way). */
export const getExhibit = async (id) =>
  check(await supabase.from('exhibits').select(FIELDS).eq('id', id).maybeSingle())

const toRow = (form, status) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  year_created: Number(form.year_created),
  category_id: form.category_id,
  technology_stack: parseTechnologies(form.technologies),
  demo_url: form.demo_url.trim() || null,
  github_url: form.github_url.trim() || null,
  status,
})

/**
 * Create or update. New image: upload first, save the row, then delete the old file.
 * If the row save fails the new upload is removed so no orphan file stays behind.
 * Returns { exhibit, cleanupFailed }.
 */
export async function saveExhibit({ id, userId, form, file, oldImagePath, status }) {
  const newPath = file ? await uploadImage(`exhibits/${userId}`, file) : null
  const row = toRow(form, status)
  if (newPath) row.image_path = newPath
  const query = id ? supabase.from('exhibits').update(row).eq('id', id) : supabase.from('exhibits').insert(row)
  const { data, error } = await query.select().single()
  if (error) {
    if (newPath) await removeImages([newPath])
    throw error
  }
  const cleanupFailed = newPath && oldImagePath ? !(await removeImages([oldImagePath])) : false
  return { exhibit: data, cleanupFailed }
}

/** Deletes the row first; only then the file. Returns { cleanupFailed }. */
export async function deleteExhibit(exhibit) {
  const { data, error } = await supabase.from('exhibits').delete().eq('id', exhibit.id).select('id')
  if (error) throw error
  if (!data.length) throw new Error('Устгах эрхгүй эсвэл бүтээл олдсонгүй.')
  return { cleanupFailed: !(await removeImages([exhibit.image_path])) }
}

export async function setExhibitStatus(id, status) {
  return check(await supabase.from('exhibits').update({ status }).eq('id', id).select().single())
}
