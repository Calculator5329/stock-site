from classes.portfolio import Portfolio, Ticker
from datetime import datetime
import numpy as np
import pandas as pd


def portfolio_data(portfolio: Portfolio) -> list[float]:
    """
    Computes several performance metrics from the given portfolio.
    
    Metrics (in order):
      1. Initial Value
      2. Ending Value
      3. Total Return = (Ending Value / Initial Value) - 1
      4. CAGR = (Ending Value/Initial Value)^(1/years) - 1
      5. Annualized Std Dev of daily returns (volatility)
      6. Best Annual Return (max yearly return)
      7. Worst Annual Return (min yearly return)
      8. Maximum Drawdown
      9. Sharpe Ratio (annualized, using risk-free rate = 2%)
      10. Sortino Ratio (annualized, using risk-free rate = 2%)
      11. Total Contributions (initial + all additions without growth)
      12. MWRR (Money-Weighted Rate of Return, as an annual rate)
      
    Returns a list of floats corresponding to these metrics.
    """
    
    # Ensure we have at least two data points
    if len(portfolio.dollar_values) < 2:
        raise ValueError("Not enough data points in portfolio to compute metrics.")
    
    # Convert portfolio.dollar_values into a pandas Series with dates as the index.
    values = pd.Series(portfolio.dollar_values, index=portfolio.dates)
    
    # 1. Initial and Ending Values
    initial = values.iloc[0]
    ending = values.iloc[-1]
    
    # 2. Total Return
    total_return = (ending / initial) - 1
    
    # 3. CAGR calculation: use the number of days between the first and last dates.
    total_days = (values.index[-1] - values.index[0]).days
    years = total_days / 365.25
    CAGR = (ending / initial) ** (1/years) - 1 if years > 0 else np.nan
    
    # 4. Daily returns and annualized volatility (assume ~252 trading days)
    daily_returns = values.pct_change().dropna()
    annualized_std = daily_returns.std() * np.sqrt(252)
    
    # 5. Best and Worst Year Returns (grouping by calendar year)
    yearly_returns = values.resample('Y').apply(lambda s: s.iloc[-1] / s.iloc[0] - 1)
    best_year = yearly_returns.max()
    worst_year = yearly_returns.min()
    
    # 6. Maximum Drawdown calculation
    running_max = values.cummax()
    drawdown = (values - running_max) / running_max
    max_drawdown = drawdown.min()  # This is negative
    
    # 7. Sharpe and Sortino Ratios
    risk_free_rate = 0.02  # Annual risk-free rate
    sharpe_ratio = np.nan if np.isclose(annualized_std, 0) else (CAGR - risk_free_rate) / annualized_std
    daily_rf = risk_free_rate / 252
    downside_returns = daily_returns[daily_returns < daily_rf]
    downside_std = downside_returns.std() * np.sqrt(252)
    sortino_ratio = np.nan if np.isclose(downside_std, 0) else (CAGR - risk_free_rate) / downside_std
    
    if sharpe_ratio > 1000:
        sharpe_ratio = np.nan
    if sortino_ratio > 1000:
        sortino_ratio = np.nan

    
    # 8. Total Contributions and MWRR calculation
    # Instead of a contribution_map, we infer contributions by comparing the actual 
    # dollar value to the expected value from pure market (raw) growth.
    total_contrib = initial  # start with the initial investment
    cashflows = []          # for MWRR: negative when money is added, positive final value
    cf_dates = list(values.index)
    
    # Tolerances for determining if a difference is negligible.
    rtol = 1e-4
    atol = 0.01  # 1 cent tolerance
    
    for i, d in enumerate(cf_dates):
        if i == 0:
            # On the first day, the cashflow is the negative initial investment.
            cashflows.append(-initial)
        else:
            # Compute expected value if no additional contribution occurred.
            raw_growth = portfolio.values[i] / portfolio.values[i-1]
            expected = portfolio.dollar_values[i-1] * raw_growth
            # Inferred contribution is the extra cash beyond expected growth.
            contrib = portfolio.dollar_values[i] - expected
            # Use np.isclose to determine if the difference is negligible.
            if not np.isclose(portfolio.dollar_values[i], expected, rtol=rtol, atol=atol):
                total_contrib += contrib
                cashflows.append(-contrib)
            else:
                cashflows.append(0.0)
    
    # On the final date, add the ending portfolio value to the cashflow.
    cashflows[-1] += ending

    # Helper functions for XNPV and XIRR.
    def xnpv(rate, cashflows, dates):
        t0 = dates[0]
        return sum([cf / (1+rate)**((d - t0).days/365.25) for cf, d in zip(cashflows, dates)])
    
    def xirr(cashflows, dates):
        r = 0.1  # initial guess
        for i in range(100):
            npv = xnpv(r, cashflows, dates)
            dr = 1e-5  # finite-difference step
            derivative = (xnpv(r+dr, cashflows, dates) - npv) / dr
            if derivative == 0:
                break
            new_r = r - npv / derivative
            if abs(new_r - r) < 1e-6:
                return new_r
            r = new_r
        return r
    
    MWRR = xirr(cashflows, cf_dates)
    
    return [
        round(initial, 2),
        round(ending, 2),
        round(total_return, 4),
        round(CAGR, 4),
        round(annualized_std, 4),
        round(best_year, 4),
        round(worst_year, 4),
        round(max_drawdown, 4),
        round(sharpe_ratio, 2),
        round(sortino_ratio, 2),
        round(total_contrib, 2),
        round(MWRR, 4)
    ]