'use client'

import { useEffect, useRef, useState } from 'react'

interface KpiCardProps {
  title: string
  value: string
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
}

function extractNumeric(value: string): { prefix: string; number: number; suffix: string } {
  const match = value.match(/^([^0-9-]*)(-?[\d,]+\.?\d*)(.*)$/)
  if (!match) return { prefix: '', number: 0, suffix: value }
  const num = parseFloat(match[2].replace(/,/g, ''))
  return { prefix: match[1], number: isNaN(num) ? 0 : num, suffix: match[3] }
}

function formatAnimatedValue(prefix: string, num: number, suffix: string, originalValue: string): string {
  // Detect if original had M/K suffixes
  if (originalValue.includes('M')) {
    return `${prefix}${num.toFixed(2)}M${suffix.replace('M', '')}`
  }
  if (originalValue.includes('K')) {
    return `${prefix}${num.toFixed(1)}K${suffix.replace('K', '')}`
  }
  if (originalValue.includes('%')) {
    const decimals = (originalValue.match(/\.(\d+)%/) || [])[1]?.length ?? 0
    return `${prefix}${num.toFixed(decimals)}%${suffix.replace('%', '')}`
  }
  if (num >= 1_000) {
    return `${prefix}${new Intl.NumberFormat('en-US').format(Math.round(num))}${suffix}`
  }
  return `${prefix}${num.toFixed(0)}${suffix}`
}

export default function KpiCard({ title, value, subtext, trend }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const { prefix, number: target, suffix } = extractNumeric(value)
    if (target === 0) {
      setDisplayValue(value)
      return
    }

    const duration = 1200
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = target * eased
      setDisplayValue(formatAnimatedValue(prefix, current, suffix, value))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayValue(value)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  const trendIcon =
    trend === 'up' ? (
      <span className="text-success text-xs flex items-center gap-0.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    ) : trend === 'down' ? (
      <span className="text-error text-xs flex items-center gap-0.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    ) : null

  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-2 animate-fade-in">
      <div className="text-text-muted text-xs font-medium uppercase tracking-wider">{title}</div>
      <div className="flex items-end gap-2">
        <div className="text-text text-2xl font-semibold tabular-nums leading-none">{displayValue}</div>
        {trendIcon}
      </div>
      {subtext && <div className="text-text-muted text-xs">{subtext}</div>}
    </div>
  )
}
