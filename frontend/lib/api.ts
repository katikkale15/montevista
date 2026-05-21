const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

export interface SimulationParams {
  initial_investment: number
  annual_contribution: number
  horizon_years: number
  mean_return: number
  volatility: number
  distribution: 'normal' | 'lognormal' | 'student_t'
  n_simulations: number
  inflation_rate: number
  seed?: number | null
}

export interface SimulationResult {
  paths: number[][]
  percentiles: { p10: number[]; p50: number[]; p90: number[] }
  stats: {
    mean_final: number
    median_final: number
    std_final: number
    p5: number
    p10: number
    p25: number
    p75: number
    p90: number
    p95: number
    success_rate: number
    max_drawdown_mean: number
    sharpe_estimate: number
  }
  histogram: { bins: number[]; counts: number[] }
  simulation_id: string
  run_time_ms: number
}

export async function simulateAPI(params: SimulationParams): Promise<SimulationResult> {
  const res = await fetch(`${API_URL}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchPresets() {
  const res = await fetch(`${API_URL}/api/presets`)
  return res.json()
}
