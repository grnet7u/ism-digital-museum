import { useEffect, useState } from 'react'

/** Runs an async loader when deps change; returns { data, error, loading, reload }. Errors are shown, never replaced with empty data. */
export function useLoad(loader, deps) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const request = JSON.stringify([...deps, attempt])

  useEffect(() => {
    let active = true // ignore answers to outdated requests
    loader().then((data) => active && setResult({ request, data, error: null }),
      (error) => active && setResult({ request, data: null, error }))
    return () => { active = false }
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- `request` already encodes deps
  }, [request])

  const loading = result?.request !== request
  return { data: loading ? null : result.data, error: loading ? null : result.error, loading, reload: () => setAttempt((n) => n + 1) }
}
