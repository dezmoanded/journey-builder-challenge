import { useState } from 'react'

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)
  return (
    <button aria-label="counter" onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  )
}
