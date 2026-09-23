import { useEffect, useState } from 'react'

/** Re-renders every `ms` so countdowns stay live. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}
