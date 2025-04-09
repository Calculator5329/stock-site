import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from functions.data import get_info
import numpy as np
from datetime import datetime

def get_ticker_values(tickers, start_date, end_date):
    ticker_values = {}
    for ticker in tickers:
        df = get_info(ticker, start_date, end_date, prices=False)
        
        series = pd.to_numeric(df["Close"], errors='coerce').dropna()

        normalized = (series / series.iloc[0]) * 100
        ticker_values[ticker] = normalized.tolist()
    
    return ticker_values

def get_stats(values, start_date, end_date, risk_free_rate=0.02):
    """
    Compute portfolio stats from time series of values and a start/end date.
    Assumes values are equally spaced (daily).
    """
    output = {}
    for ticker, values in values.items():
        if len(values) < 2:
            raise ValueError("Not enough data points to compute metrics.")

        start_date = pd.to_datetime(start_date)
        end_date = pd.to_datetime(end_date)

        # Infer date index assuming daily frequency
        dates = pd.date_range(start=start_date, end=end_date, periods=len(values))
        values = pd.Series(values, index=dates)

        initial = values.iloc[0]
        ending = values.iloc[-1]
        total_return = (ending / initial) - 1

        total_days = (end_date - start_date).days
        years = total_days / 365.25
        CAGR = (ending / initial) ** (1 / years) - 1 if years > 0 else np.nan

        daily_returns = values.pct_change().dropna()
        annualized_std = daily_returns.std() * np.sqrt(252)

        yearly_returns = values.resample('YE').apply(lambda s: s.iloc[-1] / s.iloc[0] - 1)
        best_year = yearly_returns.max()
        worst_year = yearly_returns.min()

        running_max = values.cummax()
        drawdown = (values - running_max) / running_max
        max_drawdown = drawdown.min()

        sharpe_ratio = np.nan if np.isclose(annualized_std, 0) else (CAGR - risk_free_rate) / annualized_std

        daily_rf = risk_free_rate / 252
        downside_returns = daily_returns[daily_returns < daily_rf]
        downside_std = downside_returns.std() * np.sqrt(252)
        sortino_ratio = np.nan if np.isclose(downside_std, 0) else (CAGR - risk_free_rate) / downside_std

        if sharpe_ratio is not np.nan and sharpe_ratio > 1000:
            sharpe_ratio = np.nan
        if sortino_ratio is not np.nan and sortino_ratio > 1000:
            sortino_ratio = np.nan
            
        output[ticker] = [
        round(CAGR, 4),
        round(annualized_std, 4),
        round(best_year, 4),
        round(worst_year, 4),
        round(max_drawdown, 4),
        round(sharpe_ratio, 4),
        round(sortino_ratio, 4)
    ]

    return output