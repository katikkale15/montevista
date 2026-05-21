'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ParameterSlider from '@/components/ParameterSlider'
import { simulateAPI, type SimulationParams } from '@/lib/api'
import { formatCurrency, formatPercent } from '@/lib/formatters'

type Distribution = 'normal' | 'lognormal' | 'student_t'

interface FormState {
  initial_investment: number
  annual_contribution: number
  horizon_years: number
  mean_return: number
  volatility: number
  distribution: Distribution
  inflation_rate: number
  n_simulations: number
  use_seed: boolean
  seed: number
  preset: 'conservative' | 'moderate' | 'aggressive' | 'custom'
}

const PRESETS = {
  conservative: { mean_return: 0.05, volatility: 0.08, label: 'Conservative' },
  moderate: { mean_return: 0.07, volatility: 0.12, label: 'Moderate' },
  aggressive: { mean_return: 0.10, volatility: 0.20, label: 'Aggressive' },
}

const STEP_LABELS = ['Portfolio Setup', 'Market Parameters', 'Simulation Config']

export default function SimulatePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    initial_investment: 50000,
    annual_contribution: 5000,
    horizon_years: 20,
    mean_return: 0.07,
    volatility: 0.12,
    distribution: 'lognormal',
    inflation_rate: 0.03,
    n_simulations: 5000,
    use_seed: false,
    seed: 42,
    preset: 'moderate',
  })

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const applyPreset = (key: 'conservative' | 'moderate' | 'aggressive') => {
    const p = PRESETS[key]
    set({ preset: key, mean_return: p.mean_return, volatility: p.volatility })
  }

  const canNext = () => {
    if (step === 0) return form.initial_investment > 0 && form.horizon_years > 0
    if (step === 1) return form.mean_return > 0 && form.volatility > 0
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: SimulationParams = {
        initial_investment: form.initial_investment,
        annual_contribution: form.annual_contribution,
        horizon_years: form.horizon_years,
        mean_return: form.mean_return,
        volatility: form.volatility,
        distribution: form.distribution,
        inflation_rate: form.inflation_rate,
        n_simulations: form.n_simulations,
        seed: form.use_seed ? form.seed : null,
      }
      const result = await simulateAPI(params)

      // Save results
      if (typeof window !== 'undefined') {
        localStorage.setItem('montevista_results', JSON.stringify(result))

        const historyEntry = {
          id: result.simulation_id,
          date: new Date().toISOString(),
          initial_investment: form.initial_investment,
          horizon_years: form.horizon_years,
          median_final: result.stats.median_final,
          success_rate: result.stats.success_rate,
        }
        const raw = localStorage.getItem('montevista_history')
        const history = raw ? JSON.parse(raw) : []
        history.push(historyEntry)
        localStorage.setItem('montevista_history', JSON.stringify(history.slice(-20)))
      }

      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed. Check that the API server is running.')
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-text text-3xl font-semibold tracking-tight">Simulation Builder</h1>
        <p className="text-text-muted text-sm mt-1">Configure your Monte Carlo simulation parameters</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 animate-fade-in">
        {STEP_LABELS.map((label, idx) => (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => idx < step && setStep(idx)}
              className={[
                'flex items-center gap-2 text-sm font-medium transition-colors',
                idx === step
                  ? 'text-primary'
                  : idx < step
                  ? 'text-text-muted cursor-pointer hover:text-text'
                  : 'text-text-muted/40 cursor-not-allowed',
              ].join(' ')}
            >
              <span
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                  idx === step
                    ? 'border-primary bg-primary text-bg'
                    : idx < step
                    ? 'border-primary/50 bg-primary/20 text-primary'
                    : 'border-border bg-surface text-text-muted',
                ].join(' ')}
              >
                {idx < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span className="hidden sm:block">{label}</span>
            </button>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={[
                  'flex-1 h-0.5 mx-3 rounded-full transition-colors',
                  idx < step ? 'bg-primary/50' : 'bg-border',
                ].join(' ')}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step panels */}
      <div className="relative overflow-hidden">
        {/* Step 0 — Portfolio Setup */}
        <div
          className="transition-all duration-300"
          style={{
            transform: `translateX(${(0 - step) * 110}%)`,
            position: step === 0 ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            opacity: step === 0 ? 1 : 0,
            pointerEvents: step === 0 ? 'auto' : 'none',
          }}
        >
          <div className="bg-surface border border-border rounded-xl p-6 space-y-8">
            <h2 className="text-text font-semibold">Portfolio Setup</h2>

            <ParameterSlider
              label="Initial Investment"
              value={form.initial_investment}
              min={1000}
              max={10_000_000}
              step={1000}
              onChange={(v) => set({ initial_investment: v })}
              format={formatCurrency}
            />

            <ParameterSlider
              label="Annual Contribution"
              value={form.annual_contribution}
              min={0}
              max={100_000}
              step={500}
              onChange={(v) => set({ annual_contribution: v })}
              format={formatCurrency}
            />

            <ParameterSlider
              label="Investment Horizon (years)"
              value={form.horizon_years}
              min={1}
              max={50}
              step={1}
              onChange={(v) => set({ horizon_years: v })}
              format={(v) => `${v} yr${v !== 1 ? 's' : ''}`}
            />
          </div>
        </div>

        {/* Step 1 — Market Parameters */}
        <div
          className="transition-all duration-300"
          style={{
            transform: `translateX(${(1 - step) * 110}%)`,
            position: step === 1 ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            opacity: step === 1 ? 1 : 0,
            pointerEvents: step === 1 ? 'auto' : 'none',
          }}
        >
          <div className="bg-surface border border-border rounded-xl p-6 space-y-8">
            <h2 className="text-text font-semibold">Market Parameters</h2>

            {/* Preset buttons */}
            <div>
              <div className="text-text-muted text-sm font-medium mb-3">Risk Profile</div>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={[
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                      form.preset === key
                        ? 'bg-primary text-bg border-primary'
                        : 'border-border text-text-muted hover:border-primary/50 hover:text-text',
                    ].join(' ')}
                  >
                    {PRESETS[key].label}
                  </button>
                ))}
                <button
                  onClick={() => set({ preset: 'custom' })}
                  className={[
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                    form.preset === 'custom'
                      ? 'bg-primary text-bg border-primary'
                      : 'border-border text-text-muted hover:border-primary/50 hover:text-text',
                  ].join(' ')}
                >
                  Custom
                </button>
              </div>
            </div>

            <ParameterSlider
              label="Expected Annual Return (μ)"
              value={form.mean_return}
              min={0.01}
              max={0.30}
              step={0.001}
              onChange={(v) => set({ mean_return: v, preset: 'custom' })}
              format={(v) => formatPercent(v)}
            />

            <ParameterSlider
              label="Annual Volatility (σ)"
              value={form.volatility}
              min={0.01}
              max={0.50}
              step={0.001}
              onChange={(v) => set({ volatility: v, preset: 'custom' })}
              format={(v) => formatPercent(v)}
            />

            {/* Distribution */}
            <div>
              <div className="text-text-muted text-sm font-medium mb-3">Return Distribution</div>
              <div className="flex gap-1 bg-surface-offset rounded-lg p-1">
                {([
                  { value: 'normal', label: 'Normal' },
                  { value: 'lognormal', label: 'Log-Normal' },
                  { value: 'student_t', label: 'Fat-Tailed' },
                ] as { value: Distribution; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set({ distribution: opt.value })}
                    className={[
                      'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                      form.distribution === opt.value
                        ? 'bg-surface text-text shadow-sm'
                        : 'text-text-muted hover:text-text',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inflation toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text text-sm font-medium">Inflation Adjustment</div>
                <div className="text-text-muted text-xs mt-0.5">Apply inflation to real returns</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-sm tabular-nums">{formatPercent(form.inflation_rate)}</span>
                <button
                  onClick={() => set({ inflation_rate: form.inflation_rate === 0 ? 0.03 : 0 })}
                  className={[
                    'relative w-11 h-6 rounded-full transition-colors duration-200',
                    form.inflation_rate > 0 ? 'bg-primary' : 'bg-surface-offset',
                  ].join(' ')}
                  aria-label="Toggle inflation"
                >
                  <span
                    className={[
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                      form.inflation_rate > 0 ? 'translate-x-6' : 'translate-x-1',
                    ].join(' ')}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 — Simulation Config */}
        <div
          className="transition-all duration-300"
          style={{
            transform: `translateX(${(2 - step) * 110}%)`,
            position: step === 2 ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            opacity: step === 2 ? 1 : 0,
            pointerEvents: step === 2 ? 'auto' : 'none',
          }}
        >
          <div className="bg-surface border border-border rounded-xl p-6 space-y-8">
            <h2 className="text-text font-semibold">Simulation Configuration</h2>

            {/* N simulations */}
            <div>
              <div className="text-text-muted text-sm font-medium mb-3">Number of Simulations</div>
              <div className="flex gap-1 bg-surface-offset rounded-lg p-1">
                {[1000, 5000, 10000].map((n) => (
                  <button
                    key={n}
                    onClick={() => set({ n_simulations: n })}
                    className={[
                      'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all tabular-nums',
                      form.n_simulations === n
                        ? 'bg-surface text-text shadow-sm'
                        : 'text-text-muted hover:text-text',
                    ].join(' ')}
                  >
                    {n.toLocaleString()}
                  </button>
                ))}
              </div>
              <p className="text-text-muted text-xs mt-2">
                More simulations = higher accuracy, longer runtime.
              </p>
            </div>

            {/* Random seed */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text text-sm font-medium">Fixed Random Seed</div>
                  <div className="text-text-muted text-xs mt-0.5">Reproducible results</div>
                </div>
                <button
                  onClick={() => set({ use_seed: !form.use_seed })}
                  className={[
                    'relative w-11 h-6 rounded-full transition-colors duration-200',
                    form.use_seed ? 'bg-primary' : 'bg-surface-offset',
                  ].join(' ')}
                  aria-label="Toggle seed"
                >
                  <span
                    className={[
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                      form.use_seed ? 'translate-x-6' : 'translate-x-1',
                    ].join(' ')}
                  />
                </button>
              </div>
              {form.use_seed && (
                <div className="mt-4">
                  <label className="text-text-muted text-xs mb-1 block">Seed value</label>
                  <input
                    type="number"
                    value={form.seed}
                    onChange={(e) => set({ seed: parseInt(e.target.value) || 0 })}
                    className="w-full bg-surface-offset border border-border rounded-lg px-3 py-2 text-text text-sm tabular-nums focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-surface-2 rounded-lg p-4 text-sm space-y-2">
              <div className="text-text font-medium mb-3">Simulation Summary</div>
              {[
                ['Initial Investment', formatCurrency(form.initial_investment)],
                ['Annual Contribution', formatCurrency(form.annual_contribution)],
                ['Horizon', `${form.horizon_years} years`],
                ['Expected Return', formatPercent(form.mean_return)],
                ['Volatility', formatPercent(form.volatility)],
                ['Distribution', form.distribution.replace('_', '-')],
                ['Simulations', form.n_simulations.toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-text-muted">{k}</span>
                  <span className="text-text tabular-nums">{v}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-error text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between animate-fade-in">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 rounded-xl border border-border text-text-muted hover:text-text hover:border-primary/50 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < 2 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-bg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-bg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 min-w-36 justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
                </svg>
                Run Simulation
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
