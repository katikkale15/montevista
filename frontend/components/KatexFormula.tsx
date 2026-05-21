'use client'

import { useEffect, useRef } from 'react'

interface KatexFormulaProps {
  formula: string
  displayMode?: boolean
}

export default function KatexFormula({ formula, displayMode = true }: KatexFormulaProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    import('katex').then((katex) => {
      if (cancelled || !ref.current) return
      try {
        katex.default.render(formula, ref.current, {
          displayMode,
          throwOnError: false,
          output: 'html',
        })
      } catch {
        if (ref.current) ref.current.textContent = formula
      }
    })
    return () => { cancelled = true }
  }, [formula, displayMode])

  return (
    <div
      ref={ref}
      className="overflow-x-auto py-2 text-text"
      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
    />
  )
}
