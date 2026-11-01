export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const STATUS_LABELS = { draft: 'Ноорог', pending: 'Хянагдаж буй', published: 'Нийтлэгдсэн' }

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
  if (!title) errors.title = 'Гарчиг заавал.'
  else if (title.length > 150) errors.title = 'Гарчиг 150 тэмдэгтээс хэтрэхгүй.'
  if (form.description.length > 5000) errors.description = 'Тайлбар 5000 тэмдэгтээс хэтрэхгүй.'
  const year = Number(form.year_created)
  if (!Number.isInteger(year) || year < 1990 || year > currentYear + 1) errors.year_created = `Он 1990–${currentYear + 1} хооронд байна.`
  if (!form.category_id) errors.category_id = 'Ангилал сонгоно уу.'
  const techs = parseTechnologies(form.technologies)
  if (techs.length > 20) errors.technologies = 'Хамгийн ихдээ 20 технологи.'
  else if (techs.some((t) => t.length > 40)) errors.technologies = 'Технологийн нэр 40 тэмдэгтээс хэтрэхгүй.'
  for (const field of ['demo_url', 'github_url']) {
    if (form[field].trim() && !isHttpUrl(form[field].trim())) errors[field] = 'http:// эсвэл https:// холбоос оруулна уу.'
  }
  return errors
}

export function validateImage(file) {
  if (!file) return ''
  if (!IMAGE_TYPES[file.type]) return 'Зөвхөн JPEG, PNG, WebP зураг.'
  if (file.size > MAX_IMAGE_BYTES) return 'Зураг 5 MB-аас ихгүй.'
  return ''
}
