import { t } from '../features/prefs/prefs-context'
import { supabase } from '../lib/supabase'
import { removeImages, uploadImage } from './storage'

const check = ({ data, error }) => { if (error) throw error; return data }

// Public reads: RLS returns only published rows to visitors; admins also see drafts, so pages filter where needed.
export const listTeachers = async () =>
  check(await supabase.from('teachers').select('*').order('sort_order').order('name'))
export const getTeacher = async (id) =>
  check(await supabase.from('teachers').select('*').eq('id', id).maybeSingle())

export const listEvents = async () =>
  check(await supabase.from('events').select('*').order('event_date', { ascending: false }))
export const getEvent = async (id) =>
  check(await supabase.from('events').select('*, photos:event_photos(*)').eq('id', id)
    .order('sort_order', { referencedTable: 'event_photos' }).maybeSingle())

export const listHistory = async () =>
  check(await supabase.from('history_entries').select('*').order('year'))

/** Creators = profiles with at least one published exhibit. */
export const listCreators = async () =>
  check(await supabase.from('profiles').select('id, display_name, bio, exhibits!inner(id)')
    .eq('exhibits.status', 'published').order('display_name'))
export const getCreator = async (id) =>
  check(await supabase.from('profiles').select('id, display_name, bio, created_at').eq('id', id).maybeSingle())

export const updateMyProfile = async (id, { display_name, bio }) =>
  check(await supabase.from('profiles').update({ display_name: display_name.trim(), bio: bio.trim() }).eq('id', id).select().single())

// ---------- Admin writes (RLS: admin only) ----------
/** Pending first, then published (so publication can also be revoked). */
export const listModerationQueue = async () =>
  check(await supabase.from('exhibits').select('*, creator:profiles(display_name)')
    .in('status', ['pending', 'published']).order('status').order('updated_at', { ascending: false }))

export const moderateExhibit = async (id, status, moderation_note) =>
  check(await supabase.from('exhibits').update({ status, moderation_note: moderation_note?.trim() || null }).eq('id', id).select().single())

/** Insert or update a content row; optional image goes to `<folder>/` and replaces `imageField`. */
export async function saveContent(table, { id, ...row }, { file, folder, imageField } = {}) {
  const oldPath = row[imageField]
  const newPath = file ? await uploadImage(folder, file) : null
  if (newPath) row[imageField] = newPath
  const query = id ? supabase.from(table).update(row).eq('id', id) : supabase.from(table).insert(row)
  const { data, error } = await query.select().single()
  if (error) {
    if (newPath) await removeImages([newPath])
    throw error
  }
  if (newPath && oldPath) await removeImages([oldPath])
  return data
}

/** Deletes the row, then its files. Event photos rows cascade in the DB; their files are passed in explicitly. */
export async function deleteContent(table, id, paths = []) {
  const { data, error } = await supabase.from(table).delete().eq('id', id).select('id')
  if (error) throw error
  if (!data.length) throw new Error(t('Устгах эрхгүй эсвэл бичлэг олдсонгүй.', 'Not allowed to delete, or the record was not found.'))
  return { cleanupFailed: !(await removeImages(paths)) }
}

export const addCategory = async (name, description) =>
  check(await supabase.from('exhibition_categories').insert({ name: name.trim(), description: description.trim() }).select().single())
