import { t } from '../features/prefs/prefs-context'
/** Shared loading / error / empty states. Render children only when data is ready. */
export default function LoadState({ loading, error, reload, empty, emptyText, children }) {
  if (loading) return <p role="status" className="muted">{t('Ачаалж байна…', 'Loading…')}</p>
  if (error) return <div className="error" role="alert">
    <p>{t('Мэдээлэл ачаалж чадсангүй', 'Could not load data')}: {error.message}</p>
    {reload && <button className="button" onClick={reload}>{t('Дахин оролдох', 'Try again')}</button>}
  </div>
  if (empty) return <p className="empty">{emptyText ?? t('Мэдээлэл алга.', 'Nothing here yet.')}</p>
  return children
}
