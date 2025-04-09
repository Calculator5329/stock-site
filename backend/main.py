from fastapi import FastAPI
from matplotlib import ticker
from pydantic import BaseModel
from typing import Dict
from classes.portfolio import Portfolio
from functions.ticker_values import get_ticker_values, get_stats
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["https://cheery-tiramisu-028ceb.netlify.app/", "https://cheery-tiramisu-028ceb.netlify.app"],  # Or restrict to ["http://localhost:3000"]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PortfolioRequest(BaseModel):
    portfolio: Dict[str, float]
    start_date: str  # format: YYYY-MM-DD
    end_date: str    # format: YYYY-MM-DD
    initial: float
    addition: float
    frequency: str  # "weekly", "monthly", or "yearly"
    
class TickerChartRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str

@app.get("/")
def root():
    return {"message": "Backend up and running!"}

@app.post("/portfolio")
def calculate_portfolio(data: PortfolioRequest):
    try:
        portfolio_obj = Portfolio.get_portfolio(data.portfolio, data.start_date, data.end_date)
        portfolio_obj.apply_contributions(data.initial, data.addition, data.frequency)
        portfolio_obj.analyze()
        print(portfolio_obj.get_json()['data'])
        return portfolio_obj.get_json()
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/ticker_chart")
def ticker_chart(data: TickerChartRequest):
    try:
        ticker_vals = get_ticker_values(data.tickers, data.start_date, data.end_date)
        print(ticker_vals)
        ticker_stats = get_stats(ticker_vals, data.start_date, data.end_date)
        return {
    "tickerVals": ticker_vals,
    "tickerStats": ticker_stats
}

    except Exception as e:
        return {"error": str(e)}


