from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
from classes.portfolio import Portfolio
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cheery-tiramisu-028ceb.netlify.app/", "https://cheery-tiramisu-028ceb.netlify.app"],  # Or restrict to ["http://localhost:3000"]
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
