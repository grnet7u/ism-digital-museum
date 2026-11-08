import { t } from '../prefs/prefs-context'
export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const STATUS_LABELS = {
  get draft() { return t('Ноорог', 'Draft') },
  get pending() { return t('Хянагдаж буй', 'In review') },
  get published() { return t('Нийтлэгдсэн', 'Published') },
}

/** "React, react , SQL" → ['React', 'SQL'] (trimmed, case-insensitive unique). */
export function parseTechnologies(text) {
  const seen = new Set()
  return text.split(',').map((t) => t.trim()).filter((t) => {
    const key = t.toLowerCase()
    if (!t || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const isHttpUrl = (value) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

/** Returns { field: message } for every invalid field; empty object when valid. */
export function validateExhibit(form, currentYear = new Date().getFullYear()) {
  const errors = {}
  const title = form.title.trim()
  if (!title) errors.title = t('Гарчиг заавал.', 'Title is required.')
  else if (title.length > 150) errors.title = t('Гарчиг 150 тэмдэгтээс хэтрэхгүй.', 'Title must be at most 150 characters.')
  if (form.description.length > 5000) errors.description = t('Тайлбар 5000 тэмдэгтээс хэтрэхгүй.', 'Description must be at most 5000 characters.')
  const year = Number(form.year_created)
  if (!Number.isInteger(year) || year < 1990 || year > currentYear + 1) errors.year_created = t(`Он 1990–${currentYear + 1} хооронд байна.`, `Year must be between 1990 and ${currentYear + 1}.`)
  if (!form.category_id) errors.category_id = t('Ангилал сонгоно уу.', 'Choose a category.')
  const techs = parseTechnologies(form.technologies)
  if (techs.length > 20) errors.technologies = t('Хамгийн ихдээ 20 технологи.', 'At most 20 technologies.')
  else if (techs.some((t) => t.length > 40)) errors.technologies = t('Технологийн нэр 40 тэмдэгтээс хэтрэхгүй.', 'Each technology name must be at most 40 characters.')
  for (const field of ['demo_url', 'github_url']) {
    if (form[field].trim() && !isHttpUrl(form[field].trim())) errors[field] = t('http:// эсвэл https:// холбоос оруулна уу.', 'Enter an http:// or https:// link.')
  }
  return errors
}

export function validateImage(file) {
  if (!file) return ''
  if (!IMAGE_TYPES[file.type]) return t('Зөвхөн JPEG, PNG, WebP зураг.', 'Only JPEG, PNG or WebP images.')
  if (file.size > MAX_IMAGE_BYTES) return t('Зураг 5 MB-аас ихгүй.', 'Image must be 5 MB or smaller.')
  return ''
}
