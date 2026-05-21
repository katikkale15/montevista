import os
import time
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import SimulationRequest, SimulationResponse, PresetConfig
from simulation import run_simulation

app = FastAPI(title="MonteVista API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRESETS = [
    PresetConfig(
        name="conservative",
        label="Conservative",
        mean_return=0.05,
        volatility=0.08,
        description="Bonds & stable assets. Low risk, steady growth.",
    ),
    PresetConfig(
        name="moderate",
        label="Moderate",
        mean_return=0.07,
        volatility=0.12,
        description="60/40 portfolio. Balanced risk-return profile.",
    ),
    PresetConfig(
        name="aggressive",
        label="Aggressive",
        mean_return=0.10,
        volatility=0.20,
        description="Equity-heavy. High growth potential with higher volatility.",
    ),
    PresetConfig(
        name="custom",
        label="Custom",
        mean_return=0.07,
        volatility=0.15,
        description="Set your own parameters.",
    ),
]


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/presets")
def get_presets():
    return PRESETS


@app.post("/api/simulate", response_model=SimulationResponse)
def simulate(req: SimulationRequest):
    start = time.perf_counter()
    result = run_simulation(req)
    elapsed_ms = (time.perf_counter() - start) * 1000

    return SimulationResponse(
        paths=result["paths"],
        percentiles=result["percentiles"],
        stats=result["stats"],
        histogram=result["histogram"],
        simulation_id=str(uuid.uuid4()),
        run_time_ms=round(elapsed_ms, 2),
    )
