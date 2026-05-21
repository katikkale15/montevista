'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { SimulationResult } from '@/lib/api'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/formatters'

const FanChart = dynamic(() => import('@/components/FanChart'), { ssr: false })
const Histogram = dynamic(() => import('@/components/Histogram'), { ssr: false })
const AreaChart = dynamic(() => import('@/components/AreaChart'), { ssr: false })

interface StatCardProps {
  label: string
  value: string
  dim?: boolean
}

function StatCard({ label, value, dim }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-1">
      <div className="text-text-muted text-xs font-medium uppercase tracking-wider">{label}</div>
      <div className={['text-xl font-semibold tabular-nums', dim ? 'text-text-muted' : 'text-text'].join(' ')}>
        {value}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="skeleton h-20 rounded-xl" />
}

export default function ResultsPage() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const fanChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('montevista_results')
      if (raw) setResult(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  const downloadCSV = () => {
    if (!result) return
    const { p10, p50, p90 } = result.percentiles
    const rows = [
      ['Year', 'P10', 'P50 (Median)', 'P90'],
      ...p50.map((_, i) => [i + 1, p10[i]?.toFixed(2), p50[i]?.toFixed(2), p90[i]?.toFixed(2)]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `montevista_results_${result.simulation_id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    if (!fanChartRef.current) return
    const canvas = fanChartRef.current.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'montevista_fan_chart.png'
    a.click()
  }

  if (loading) {
    return (
      <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="skeleton h-80 rounded-xl" />
        <div className="skeleton h-60 rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="px-6 py-8 max-w-6xl mx-auto flex flex-col items-center justify-center py-32 text-center">
        <div className="text-text-muted text-6xl mb-4">📊</div>
        <h2 className="text-text text-2xl font-semibold mb-2">No results yet</h2>
        <p className="text-text-muted mb-6 max-w-sm">
          Run a simulation first to see your results here.
        </p>
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-bg font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Go to Simulator
        </Link>
      </div>
    )
  }

  const { stats, percentiles, histogram, paths } = result

  const statCards = [
    { label: 'Mean Final', value: formatCurrency(stats.mean_final) },
    { label: 'Median Final', value: formatCurrency(stats.median_final) },
    { label: 'Std Deviation', value: formatCurrency(stats.std_final) },
    { label: 'P5 (5th %ile)', value: formatCurrency(stats.p5) },
    { label: 'P10 (10th %ile)', value: formatCurrency(stats.p10) },
    { label: 'P90 (90th %ile)', value: formatCurrency(stats.p90) },
    { label: 'P95 (95th %ile)', value: formatCurrency(stats.p95) },
    { label: 'Sharpe Estimate', value: stats.sharpe_estimate.toFixed(2), dim: stats.sharpe_estimate < 0 },
  ]

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-text text-3xl font-semibold tracking-tight">Simulation Results</h1>
          <p className="text-text-muted text-sm mt-1">
            ID: <span className="tabular-nums font-mono text-xs">{result.simulation_id}</span>
            {' · '}
            <span className="tabular-nums">{result.run_time_ms.toFixed(0)}ms</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-primary/40 text-xs font-medium transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v8M3 6l3.5 3.5L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            CSV
          </button>
          <button
            onClick={downloadPNG}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-primary/40 text-xs font-medium transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 9l3-3 3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            PNG
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <StatCard label={card.label} value={card.value} dim={card.dim} />
          </div>
        ))}
      </div>

      {/* Success rate + max drawdown highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold tabular-nums shrink-0"
            style={{
              background: `conic-gradient(var(--success) ${stats.success_rate * 360}deg, var(--surface-offset) 0)`,
            }}
          >
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-success">
              {(stats.success_rate * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-text font-semibold">Success Rate</div>
            <div className="text-text-muted text-sm">Simulations that ended above initial investment</div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center shrink-0">
            <span className="text-error text-sm font-bold tabular-nums">
              {formatPercent(stats.max_drawdown_mean)}
            </span>
          </div>
          <div>
            <div className="text-text font-semibold">Avg Max Drawdown</div>
            <div className="text-text-muted text-sm">Mean worst-case portfolio decline across all paths</div>
          </div>
        </div>
      </div>

      {/* Fan chart */}
      <div className="animate-fade-in" style={{ animationDelay: '250ms' }} ref={fanChartRef}>
        <FanChart paths={paths} percentiles={percentiles} />
      </div>

      {/* Area chart */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <AreaChart percentiles={percentiles} />
      </div>

      {/* Histogram */}
      <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
        <Histogram
          bins={histogram.bins}
          counts={histogram.counts}
          p25={stats.p25}
          p75={stats.p75}
        />
      </div>

      {/* Year-by-year table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-text font-semibold text-sm">Year-by-Year Percentiles</h3>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface z-10">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Year</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">P10</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">P50 (Median)</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">P90</th>
              </tr>
            </thead>
            <tbody>
              {percentiles.p50.map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-surface-offset/40 transition-colors"
                >
                  <td className="px-6 py-2.5 text-text-muted tabular-nums">{i + 1}</td>
                  <td className="px-6 py-2.5 text-warning text-right tabular-nums">
                    {formatCurrency(percentiles.p10[i] ?? 0)}
                  </td>
                  <td className="px-6 py-2.5 text-primary text-right tabular-nums font-medium">
                    {formatCurrency(percentiles.p50[i] ?? 0)}
                  </td>
                  <td className="px-6 py-2.5 text-success text-right tabular-nums">
                    {formatCurrency(percentiles.p90[i] ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-run CTA */}
      <div className="flex justify-start animate-fade-in" style={{ animationDelay: '450ms' }}>
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 border border-border hover:border-primary/50 text-text-muted hover:text-text px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          Run Another Simulation
        </Link>
      </div>
    </div>
  )
}
