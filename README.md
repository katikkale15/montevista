# MonteVista — Financial Risk Analysis Dashboard

A full-stack Monte Carlo simulation platform for portfolio risk analysis. Run thousands of simulated market paths, explore percentile outcomes, and export results.

**Live stack**: Next.js 16 (frontend) + FastAPI (backend)  
**Deploy target**: Vercel + Render

---

## Architecture

```
montevista/
├── frontend/   Next.js 16, TypeScript, Tailwind CSS v4, Chart.js
└── backend/    FastAPI, NumPy GBM simulation engine, Pydantic
```

**Simulation math** — Geometric Brownian Motion (GBM):
```
S(t+1) = S(t) × exp((μ - σ²/2)·Δt + σ·√Δt·Z)
```
Supports Normal, Log-Normal, and Fat-Tailed (Student-t, df=5) distributions. Fully vectorised with NumPy — no Python loops over simulation paths.

---

## Local Development

### Backend (FastAPI on port 8002)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

Test: `curl http://localhost:8002/api/health`

### Frontend (Next.js on port 3000)

```bash
cd frontend
npm install
# .env.local already contains: NEXT_PUBLIC_API_URL=http://localhost:8002
npm run dev
```

Open `http://localhost:3000` (or whichever port Next.js picks if 3000 is taken).

---

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — KPI cards, recent simulations history, CTA |
| `/simulate` | 3-step simulation builder with preset risk profiles |
| `/results` | Charts (fan chart, histogram, area chart), stats grid, year-by-year table, CSV/PNG export |
| `/about` | Monte Carlo methodology, GBM formula (KaTeX), glossary |

---

## Deploy to Render (Backend)

1. Push repo to GitHub
2. New Web Service → connect repo → set root dir to `backend/`
3. **Build command**: `pip install -r requirements.txt`
4. **Start command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env var: `FRONTEND_URL = https://your-vercel-url.vercel.app`
6. Deploy — note the Render URL (e.g. `https://montevista-api.onrender.com`)

`render.yaml` is included for Infrastructure-as-Code deployment.

---

## Deploy to Vercel (Frontend)

1. New Project → connect repo → set root dir to `frontend/`
2. Add env var in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://montevista-api.onrender.com`)
3. Deploy

`vercel.json` is included and rewrites `/api/*` to the backend URL.

---

## API Reference

### `POST /api/simulate`

```json
{
  "initial_investment": 100000,
  "annual_contribution": 5000,
  "horizon_years": 20,
  "mean_return": 0.07,
  "volatility": 0.15,
  "distribution": "lognormal",
  "n_simulations": 5000,
  "inflation_rate": 0.03,
  "seed": null
}
```

Returns: `paths` (200 sampled), `percentiles` (p10/p50/p90 time-series), `stats` (scalar summaries), `histogram`, `simulation_id`, `run_time_ms`.

### `GET /api/presets` — returns 4 asset class configs (conservative/moderate/aggressive/custom)
### `GET /api/health` — `{"status": "ok", "version": "1.0.0"}`

---

## Tech Stack Details

- **Frontend**: Next.js 16.2.6, React 19.2, Tailwind CSS v4 (`@theme inline`), `react-chartjs-2` 5.x, KaTeX
- **Backend**: FastAPI, Pydantic v2, NumPy, SciPy, Uvicorn
- **Charts**: Chart.js 4.x — Fan chart (200 paths + P10/P50/P90), Histogram (percentile colour bands), Area chart (Filler plugin)
- **Design**: Dark-first with light mode toggle. Teal accent (`#2dd4bf`). Instrument Serif headings. Tabular-nums on all data cells.
