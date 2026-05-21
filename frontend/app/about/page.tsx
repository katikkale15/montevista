import type { Metadata } from 'next'
import KatexFormula from '@/components/KatexFormula'

export const metadata: Metadata = {
  title: 'About — MonteVista',
  description: 'Learn about Monte Carlo simulation methodology used in MonteVista.',
}

const glossary = [
  {
    term: 'μ (mu)',
    description: 'The expected (mean) annual return of the portfolio. Represents the average growth rate assumption.',
  },
  {
    term: 'σ (sigma)',
    description: 'Annual volatility, measuring the standard deviation of returns. Higher σ means wider range of outcomes.',
  },
  {
    term: 'P10',
    description: '10th percentile — only 10% of simulated outcomes fall below this value. A pessimistic scenario.',
  },
  {
    term: 'P50',
    description: '50th percentile (median) — half of outcomes are below and half above. The "most likely" scenario.',
  },
  {
    term: 'P90',
    description: '90th percentile — 90% of outcomes fall below this value. An optimistic scenario.',
  },
  {
    term: 'Sharpe Ratio',
    description: 'Risk-adjusted return: (Portfolio Return − Risk-Free Rate) ÷ Volatility. Higher is better.',
  },
  {
    term: 'VaR',
    description: 'Value at Risk — the potential loss in a portfolio over a given time period at a specific confidence level.',
  },
  {
    term: 'GBM',
    description: 'Geometric Brownian Motion — the mathematical model used to simulate asset price paths.',
  },
  {
    term: 'Max Drawdown',
    description: 'The largest peak-to-trough decline in portfolio value. A key measure of downside risk.',
  },
]

export default function AboutPage() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-text text-3xl font-semibold tracking-tight">About MonteVista</h1>
        <p className="text-text-muted mt-2 text-sm">
          Methodology, mathematics, and glossary
        </p>
      </div>

      {/* What is Monte Carlo */}
      <section className="space-y-4">
        <h2 className="text-text text-xl font-semibold">What is Monte Carlo Simulation?</h2>
        <div className="text-text-muted leading-relaxed space-y-3 text-sm">
          <p>
            Monte Carlo simulation is a computational technique that uses random sampling to model
            the probability of different outcomes in processes that cannot easily be predicted due
            to the intervention of random variables.
          </p>
          <p>
            In financial modeling, we simulate thousands of possible future price paths for a
            portfolio, each driven by randomly sampled market returns. By aggregating these paths,
            we can build a statistical picture of potential outcomes — helping investors understand
            not just the expected result, but the full distribution of possibilities.
          </p>
          <p>
            MonteVista runs between 1,000 and 10,000 independent simulations per analysis. Each
            simulation generates a year-by-year path for your portfolio value based on your chosen
            parameters: expected return, volatility, contributions, and time horizon.
          </p>
        </div>
      </section>

      {/* Mathematical Model */}
      <section className="space-y-6">
        <h2 className="text-text text-xl font-semibold">Mathematical Model</h2>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-text font-medium text-sm">Geometric Brownian Motion (GBM)</h3>
          <p className="text-text-muted text-sm">
            Asset prices are modeled using Geometric Brownian Motion, which ensures prices
            remain positive and captures both deterministic drift (μ) and random shocks (σ):
          </p>
          <KatexFormula formula="S(t+1) = S(t) \cdot \exp\!\left(\left(\mu - \frac{\sigma^2}{2}\right)\Delta t + \sigma\sqrt{\Delta t}\cdot Z\right)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              ['S(t)', 'Portfolio value at time t'],
              ['μ', 'Expected annual return (drift)'],
              ['σ', 'Annual volatility'],
              ['Δt', 'Time step (1 year)'],
              ['Z', 'Standard normal random variable Z ~ N(0,1)'],
              ['σ²/2', 'Itô correction for log-normal variance'],
            ].map(([sym, desc]) => (
              <div key={sym} className="flex gap-2 text-xs">
                <code className="text-primary font-mono shrink-0">{sym}</code>
                <span className="text-text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-text font-medium text-sm">Log-Normal Returns</h3>
          <p className="text-text-muted text-sm">
            Under log-normal assumptions, single-period returns follow:
          </p>
          <KatexFormula formula="r_t = \exp\!\left(\mu - \frac{\sigma^2}{2} + \sigma Z_t\right) - 1" />
          <p className="text-text-muted text-sm">
            This ensures returns cannot fall below −100%, preventing portfolio values from going negative.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-text font-medium text-sm">Sharpe Ratio Estimate</h3>
          <p className="text-text-muted text-sm">
            The estimated Sharpe ratio compares excess return to risk:
          </p>
          <KatexFormula formula="\hat{S} = \frac{\mu - r_f}{\sigma}" />
          <p className="text-text-muted text-xs mt-2 text-text-muted/70">
            Where r_f is the risk-free rate (assumed 0% in simulations unless adjusted).
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-text font-medium text-sm">Fat-Tailed Distribution (Student-t)</h3>
          <p className="text-text-muted text-sm">
            For the &quot;Fat-Tailed&quot; distribution option, random shocks are drawn from a
            Student-t distribution with ν degrees of freedom, capturing the higher probability
            of extreme events observed in real markets:
          </p>
          <KatexFormula formula="Z_t \sim t_\nu, \quad \nu = 5" />
          <p className="text-text-muted text-xs mt-2 text-text-muted/70">
            Lower degrees of freedom → heavier tails → more frequent extreme outcomes.
          </p>
        </div>
      </section>

      {/* Glossary */}
      <section className="space-y-4">
        <h2 className="text-text text-xl font-semibold">Glossary</h2>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider w-36">Term</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Definition</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((row) => (
                <tr key={row.term} className="border-b border-border last:border-0 hover:bg-surface-offset/40 transition-colors">
                  <td className="px-6 py-3 text-primary font-mono text-xs font-medium whitespace-nowrap">{row.term}</td>
                  <td className="px-6 py-3 text-text-muted leading-relaxed">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assumptions & Limitations */}
      <section className="space-y-4">
        <h2 className="text-text text-xl font-semibold">Assumptions & Limitations</h2>
        <div className="bg-surface border border-border rounded-xl p-6">
          <ul className="space-y-3 text-text-muted text-sm">
            {[
              'Returns are assumed to be independently and identically distributed (i.i.d.) over time — no autocorrelation.',
              'The model does not account for taxes, transaction costs, or management fees.',
              'Annual contributions are assumed to be deposited at the start of each year.',
              'Volatility is assumed constant (homoskedastic) — real markets exhibit volatility clustering.',
              'This tool is for educational and planning purposes only, not financial advice.',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-warning mt-0.5 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
