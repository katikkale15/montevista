'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import KpiCard from '@/components/KpiCard'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { SimulationResult } from '@/lib/api'

interface HistoryEntry {
  id: string
  date: string
  initial_investment: number
  horizon_years: number
  median_final: number
  success_rate: number
}

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [latestResult, setLatestResult] = useState<SimulationResult | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem('montevista_history')
      if (raw) {
        const parsed: HistoryEntry[] = JSON.parse(raw)
        setHistory(parsed.slice(-5).reverse())
      }
      const resultRaw = localStorage.getItem('montevista_results')
      if (resultRaw) {
        setLatestResult(JSON.parse(resultRaw))
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  const medianReturn = latestResult
    ? formatCurrency(latestResult.stats.median_final)
    : '--'
  const p10Outcome = latestResult
    ? formatCurrency(latestResult.stats.p5)
    : '--'
  const successRate = latestResult
    ? formatPercent(latestResult.stats.success_rate)
    : '--'

  const hasHistory = mounted && history.length > 0

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-text text-3xl font-semibold tracking-tight">MonteVista</h1>
        <p
          className="text-text-muted text-lg mt-1"
          style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}
        >
          Financial Risk Analysis Dashboard
        </p>
      </div>

      {!mounted ? (
        /* Skeleton while mounting */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : !hasHistory && !latestResult ? (
        /* Hero CTA — no data yet */
        <div className="animate-fade-in flex flex-col items-center justify-center text-center py-20 px-4 bg-surface border border-border rounded-2xl">
          <div className="text-primary mb-4">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <path
                d="M4 24 L4 18 L10 18 L10 12 L16 12 L16 8 L22 8 L22 4 L28 4 L28 24 Z"
                fill="currentColor"
                opacity="0.15"
              />
              <polyline
                points="4,24 4,18 10,18 10,12 16,12 16,8 22,8 22,4 28,4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <h2
            className="text-text text-4xl font-normal mb-3"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Visualize Your Financial Future
          </h2>
          <p className="text-text-muted text-base max-w-lg mb-8 leading-relaxed">
            Run thousands of Monte Carlo simulations to understand the range of possible outcomes
            for your investment portfolio. Explore risk, set expectations, and plan with confidence.
          </p>
          <Link
            href="/simulate"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-bg font-semibold px-6 py-3 rounded-xl transition-colors duration-150 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Run Your First Simulation
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              title="Median Return"
              value={medianReturn}
              subtext="50th percentile final value"
              trend="up"
            />
            <KpiCard
              title="P10 Outcome"
              value={p10Outcome}
              subtext="Worst 10% scenario"
              trend="neutral"
            />
            <KpiCard
              title="Success Rate"
              value={successRate}
              subtext="Simulations above initial"
              trend={latestResult && latestResult.stats.success_rate > 0.5 ? 'up' : 'down'}
            />
          </div>

          {/* Recent simulations table */}
          {hasHistory && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-text font-semibold text-sm">Recent Simulations</h2>
                <Link
                  href="/simulate"
                  className="text-primary hover:text-primary-hover text-xs font-medium transition-colors"
                >
                  + New simulation
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Initial</th>
                      <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Horizon</th>
                      <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Median Final</th>
                      <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Success</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className="border-b border-border last:border-0 hover:bg-surface-offset/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${idx * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
                      >
                        <td className="px-6 py-3 text-text-muted tabular-nums">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-3 text-text text-right tabular-nums">
                          {formatCurrency(entry.initial_investment)}
                        </td>
                        <td className="px-6 py-3 text-text text-right tabular-nums">
                          {entry.horizon_years}y
                        </td>
                        <td className="px-6 py-3 text-text text-right tabular-nums">
                          {formatCurrency(entry.median_final)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums">
                          <span
                            className={[
                              'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                              entry.success_rate >= 0.7
                                ? 'bg-success/15 text-success'
                                : entry.success_rate >= 0.5
                                ? 'bg-warning/15 text-warning'
                                : 'bg-error/15 text-error',
                            ].join(' ')}
                          >
                            {formatPercent(entry.success_rate)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-start animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link
              href="/simulate"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-bg font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Run New Simulation
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
