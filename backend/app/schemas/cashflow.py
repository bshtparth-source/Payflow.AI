from pydantic import BaseModel
from typing import List


class CashflowSeriesPoint(BaseModel):
    date: str
    nominal_due_paise: int
    projected_inflow_paise: int
    projected_gap_paise: int


class CashflowForecastResponse(BaseModel):
    disclaimer: str = "Cash-flow projections are ESTIMATES based on buyer historical delay patterns."
    projected_period_days: int = 60
    expected_total_inflow_paise: int
    projected_realizable_paise: int
    projected_delayed_shortfall_paise: int
    forecast_series: List[CashflowSeriesPoint]
