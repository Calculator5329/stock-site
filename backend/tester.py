import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
from classes.portfolio import Portfolio, Ticker
from functions.portfolio import portfolio_data
import random

# Settings
initial = 10000
annual_return = 0.10
years = 2
trading_days_per_year = 252
total_days = int(years * trading_days_per_year)
daily_growth = (1 + annual_return) ** (1 / trading_days_per_year)

# Generate portfolio values
dates = pd.bdate_range(start="2020-01-01", periods=total_days)
values = [100 * (daily_growth ** i) for i in range(total_days)]  # normalized to 100
dollar_values = [initial * (daily_growth ** i) for i in range(total_days)]  # raw $

# Create Portfolio
portfolio = Portfolio(values=values, dates=dates)

# Apply contributions: starting with $10,000 and adding $500 monthly
portfolio.apply_contributions(initial=initial, addition=0, frequency='monthly')

# Calculate portfolio metrics using portfolio_data function
metrics = portfolio_data(portfolio)

# Define labels for all 12 metrics
labels = [
    "Initial Value",
    "Ending Value",
    "Total Return",
    "CAGR",
    "Annualized Std Dev",
    "Best Year Return",
    "Worst Year Return",
    "Maximum Drawdown",
    "Sharpe Ratio",
    "Sortino Ratio",
    "Total Contributions",
    "MWRR"
]

print("Portfolio Metrics:")
for label, metric in zip(labels, metrics):
    print(f"{label}: {metric}")

# Optionally, plot the portfolio's dollar values over time
plt.figure(figsize=(10, 5))
plt.plot(portfolio.dates, portfolio.dollar_values, label='Portfolio Value')
plt.xlabel("Date")
plt.ylabel("Portfolio Value ($)")
plt.title("Portfolio Growth Over 5 Years (S&P 500-like Performance)")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
