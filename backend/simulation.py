import numpy as np
from scipy import stats
from typing import Tuple, Dict, Any
from models import SimulationRequest, Distribution


def run_simulation(req: SimulationRequest) -> Dict[str, Any]:
    rng = np.random.default_rng(req.seed)
    n = req.n_simulations
    T = req.horizon_years
    dt = 1.0  # annual steps

    mu = req.mean_return
    sigma = req.volatility
    drift = (mu - 0.5 * sigma ** 2) * dt

    # shape: (n_sims, horizon)
    if req.distribution == Distribution.normal:
        Z = rng.standard_normal((n, T))
    elif req.distribution == Distribution.lognormal:
        Z = rng.standard_normal((n, T))
    else:  # student_t, df=5 for fat tails
        Z = rng.standard_t(df=5, size=(n, T))
        # normalize to unit variance
        Z = Z / np.sqrt(5 / 3)

    log_returns = drift + sigma * np.sqrt(dt) * Z  # (n, T)

    # Build paths with shape (n, T+1) — index 0 is initial investment
    paths = np.zeros((n, T + 1))
    paths[:, 0] = req.initial_investment

    real_factor = 1.0 / (1.0 + req.inflation_rate)

    for t in range(T):
        paths[:, t + 1] = (
            paths[:, t] * np.exp(log_returns[:, t]) + req.annual_contribution
        ) * real_factor

    # Clamp negative values (shouldn't happen with contributions, but guard against it)
    paths = np.maximum(paths, 0.0)

    final_values = paths[:, -1]

    # Percentile time-series (shape: horizon+1 each)
    pct_p10 = np.percentile(paths, 10, axis=0).tolist()
    pct_p50 = np.percentile(paths, 50, axis=0).tolist()
    pct_p90 = np.percentile(paths, 90, axis=0).tolist()

    # Stats on final values
    mean_final = float(np.mean(final_values))
    median_final = float(np.median(final_values))
    std_final = float(np.std(final_values))
    p5 = float(np.percentile(final_values, 5))
    p10 = float(np.percentile(final_values, 10))
    p25 = float(np.percentile(final_values, 25))
    p75 = float(np.percentile(final_values, 75))
    p90 = float(np.percentile(final_values, 90))
    p95 = float(np.percentile(final_values, 95))
    success_rate = float(np.mean(final_values > req.initial_investment))

    # Max drawdown per path, then average
    running_max = np.maximum.accumulate(paths, axis=1)
    drawdowns = (running_max - paths) / np.where(running_max > 0, running_max, 1)
    max_drawdown_mean = float(np.mean(np.max(drawdowns, axis=1)))

    # Sharpe estimate: annualized mean excess return / volatility
    # Use realized log-returns of median path as proxy
    median_path = np.array(pct_p50)
    log_rets = np.diff(np.log(np.where(median_path > 0, median_path, 1e-9)))
    rf = 0.04  # risk-free rate assumption
    if log_rets.std() > 0:
        sharpe_estimate = float((log_rets.mean() - rf / T) / log_rets.std() * np.sqrt(T))
    else:
        sharpe_estimate = 0.0

    # Histogram of final values
    counts, bin_edges = np.histogram(final_values, bins=50)

    # Downsample paths for response (send 200 paths max to keep payload manageable)
    sample_size = min(200, n)
    idx = rng.choice(n, size=sample_size, replace=False)
    sampled_paths = paths[idx].tolist()

    return {
        "paths": sampled_paths,
        "percentiles": {"p10": pct_p10, "p50": pct_p50, "p90": pct_p90},
        "stats": {
            "mean_final": mean_final,
            "median_final": median_final,
            "std_final": std_final,
            "p5": p5,
            "p10": p10,
            "p25": p25,
            "p75": p75,
            "p90": p90,
            "p95": p95,
            "success_rate": success_rate,
            "max_drawdown_mean": max_drawdown_mean,
            "sharpe_estimate": sharpe_estimate,
        },
        "histogram": {
            "bins": bin_edges.tolist(),
            "counts": counts.tolist(),
        },
    }
