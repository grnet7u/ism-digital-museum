/** Shared loading / error / empty states. Render children only when data is ready. */
export default function LoadState({ loading, error, reload, empty, emptyText = 'Мэдээлэл алга.', children }) {
  if (loading) return <p role="status" className="muted">Ачаалж байна…</p>
  if (error) return <div className="error" role="alert">
    <p>Мэдээлэл ачаалж чадсангүй: {error.message}</p>
    {reload && <button className="button" onClick={reload}>Дахин оролдох</button>}
  </div>
  if (empty) return <p className="empty">{emptyText}</p>
  return children
}
