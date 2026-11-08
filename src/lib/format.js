import { t } from '../features/prefs/prefs-context'
// event_date is a calendar date ("2025-05-14"); format the string itself so no timezone shift happens.
export const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return t(`${y} оны ${m}-р сарын ${d}`, new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { timeZone: 'UTC', dateStyle: 'long' }))
}
