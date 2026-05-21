from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from enum import Enum


class Distribution(str, Enum):
    normal = "normal"
    lognormal = "lognormal"
    student_t = "student_t"


class SimulationRequest(BaseModel):
    initial_investment: float = Field(gt=0)
    annual_contribution: float = Field(ge=0, default=0)
    horizon_years: int = Field(ge=1, le=50)
    mean_return: float = Field(description="e.g. 0.07 for 7%")
    volatility: float = Field(gt=0, description="e.g. 0.15 for 15%")
    distribution: Distribution = Distribution.lognormal
    n_simulations: int = Field(default=1000, ge=100, le=10000)
    inflation_rate: float = Field(default=0.03, ge=0)
    seed: Optional[int] = None


class PercentilesResult(BaseModel):
    p10: List[float]
    p50: List[float]
    p90: List[float]


class StatsResult(BaseModel):
    mean_final: float
    median_final: float
    std_final: float
    p5: float
    p10: float
    p25: float
    p75: float
    p90: float
    p95: float
    success_rate: float
    max_drawdown_mean: float
    sharpe_estimate: float


class HistogramResult(BaseModel):
    bins: List[float]
    counts: List[int]


class SimulationResponse(BaseModel):
    paths: List[List[float]]
    percentiles: PercentilesResult
    stats: StatsResult
    histogram: HistogramResult
    simulation_id: str
    run_time_ms: float


class PresetConfig(BaseModel):
    name: str
    label: str
    mean_return: float
    volatility: float
    description: str
