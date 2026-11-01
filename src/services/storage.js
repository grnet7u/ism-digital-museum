import { supabase } from '../lib/supabase'
import { IMAGE_TYPES } from '../features/exhibits/validate'

const BUCKET = 'museum-media'

/** Uploads to a fresh `<folder>/<uuid>.<ext>` path (never overwrites) and returns the path. */
export async function uploadImage(folder, file) {
  const path = `${folder}/${crypto.randomUUID()}.${IMAGE_TYPES[file.type]}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (error) throw error
  return path
}

/** Returns true when every file was removed; storage RLS ignores paths the user does not own. */
export async function removeImages(paths) {
  const list = paths.filter(Boolean)
  if (!list.length) return true
  const { data, error } = await supabase.storage.from(BUCKET).remove(list)
  return !error && data.length === list.length
}

/** Private bucket: rows store paths; readable files get short-lived signed URLs. Returns { path: url }. */
export async function signedUrls(paths) {
  const list = [...new Set(paths.filter(Boolean))]
  if (!list.length) return {}
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(list, 3600)
  if (error) throw error
  return Object.fromEntries(data.filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]))
}
