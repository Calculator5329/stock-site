import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from functions.data import get_info
import numpy as np

class Portfolio:
    def __init__(self, values: list[float], dates: list[str]):
        self.values = values  # normalized portfolio values
        self.dates = pd.to_datetime(dates)
        self.dollar_values = values
        self.data = []
        
    @staticmethod
    def get_portfolio(portfolio: dict, start_date: str, end_date: str):
        tickers = []
        for ticker, weight in portfolio.items():
            
            df = get_info(ticker, start_date, end_date, prices=False)

            series = df['Close'].dropna()
            normalized = (series / series.iloc[0]) * 100
            weighted = normalized * weight
            tickers.append(weighted)

        if not tickers:
            raise ValueError("No valid data for any tickers.")

        # Align on common dates
        df_all = pd.concat(tickers, axis=1).dropna()
        portfolio_series = df_all.sum(axis=1)

        return Portfolio(values=portfolio_series.tolist(), dates=portfolio_series.index.tolist())

    def apply_contributions(self, initial: float, addition: float, frequency: str = 'monthly'):
        """
        frequency: 'weekly', 'monthly', 'yearly'
        """
        valid_freqs = ['weekly', 'monthly', 'yearly']
        if frequency not in valid_freqs:
            raise ValueError(f"Frequency must be one of {valid_freqs}")

        current_value = initial
        self.dollar_values = [initial]

        last_contrib_date = self.dates[0]

        for i in range(1, len(self.values)):
            growth = self.values[i] / self.values[i - 1]
            current_value *= growth

            # Check if it's time to contribute
            if self._should_contribute(self.dates[i], last_contrib_date, frequency):
                current_value += addition
                last_contrib_date = self.dates[i]

            self.dollar_values.append(round(current_value, 2))

    def _should_contribute(self, current_date, last_contrib_date, frequency):
        delta = (current_date - last_contrib_date).days
        if frequency == 'weekly':
            return delta >= 7
        elif frequency == 'monthly':
            return current_date.month != last_contrib_date.month or current_date.year != last_contrib_date.year
        elif frequency == 'yearly':
            return current_date.year != last_contrib_date.year

    def analyze(self):
        """
        Computes several performance metrics from the portfolio and sets self.data.

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
        """
        if len(self.dollar_values) < 2:
            raise ValueError("Not enough data points in portfolio to compute metrics.")

        values = pd.Series(self.dollar_values, index=self.dates)
        initial = values.iloc[0]
        ending = values.iloc[-1]
        total_return = (ending / initial) - 1

        total_days = (values.index[-1] - values.index[0]).days
        years = total_days / 365.25
        CAGR = (ending / initial) ** (1/years) - 1 if years > 0 else np.nan

        daily_returns = values.pct_change().dropna()
        annualized_std = daily_returns.std() * np.sqrt(252)

        yearly_returns = values.resample('Y').apply(lambda s: s.iloc[-1] / s.iloc[0] - 1)
        best_year = yearly_returns.max()
        worst_year = yearly_returns.min()

        running_max = values.cummax()
        drawdown = (values - running_max) / running_max
        max_drawdown = drawdown.min()

        risk_free_rate = 0.02
        sharpe_ratio = np.nan if np.isclose(annualized_std, 0) else (CAGR - risk_free_rate) / annualized_std

        daily_rf = risk_free_rate / 252
        downside_returns = daily_returns[daily_returns < daily_rf]
        downside_std = downside_returns.std() * np.sqrt(252)
        sortino_ratio = np.nan if np.isclose(downside_std, 0) else (CAGR - risk_free_rate) / downside_std

        if sharpe_ratio is not np.nan and sharpe_ratio > 1000:
            sharpe_ratio = np.nan
        if sortino_ratio is not np.nan and sortino_ratio > 1000:
            sortino_ratio = np.nan

        total_contrib = initial
        cashflows = []
        cf_dates = list(values.index)

        rtol = 1e-4
        atol = 0.01

        for i, d in enumerate(cf_dates):
            if i == 0:
                cashflows.append(-initial)
            else:
                raw_growth = self.values[i] / self.values[i - 1]
                expected = self.dollar_values[i - 1] * raw_growth
                contrib = self.dollar_values[i] - expected
                if not np.isclose(self.dollar_values[i], expected, rtol=rtol, atol=atol):
                    total_contrib += contrib
                    cashflows.append(-contrib)
                else:
                    cashflows.append(0.0)

        cashflows[-1] += ending

        def xnpv(rate, cashflows, dates):
            t0 = dates[0]
            return sum([cf / (1+rate)**((d - t0).days/365.25) for cf, d in zip(cashflows, dates)])

        def xirr(cashflows, dates):
            r = 0.1
            for _ in range(100):
                npv = xnpv(r, cashflows, dates)
                dr = 1e-5
                derivative = (xnpv(r + dr, cashflows, dates) - npv) / dr
                if derivative == 0:
                    break
                new_r = r - npv / derivative
                if abs(new_r - r) < 1e-6:
                    return new_r
                r = new_r
            return r

        MWRR = xirr(cashflows, cf_dates)

        self.data = [
            round(initial, 2),
            round(ending, 2),
            round(total_return, 4),
            round(CAGR, 4),
            round(annualized_std, 4),
            round(best_year, 4),
            round(worst_year, 4),
            round(max_drawdown, 4),
            round(sharpe_ratio, 4),
            round(sortino_ratio, 4),
            round(total_contrib, 2),
            round(MWRR, 4)
        ]
        
    def get_json(self):
        return {
            "dates": [d.strftime("%Y-%m-%d") for d in self.dates],
            "portfolio": self.dollar_values,
            "data": self.data
        }
        

   
class Ticker:
    def __init__(self, ticker):
        self.ticker = ticker
        self.prices = []
        self.weight = 0.0
    
    def set_prices(self, start_date, end_date):
        self.prices = get_info(self.ticker, start_date, end_date)
    