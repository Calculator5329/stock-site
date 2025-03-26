import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from functions.data import get_info

class Portfolio:
    def __init__(self, values: list[float], dates: list[str]):
        self.values = values  # normalized portfolio values
        self.dates = pd.to_datetime(dates)
        self.dollar_values = values

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

    def get_json(self):
        return {
            "dates": [d.strftime("%Y-%m-%d") for d in self.dates],
            "portfolio": self.dollar_values,
        }

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

class Ticker:
    def __init__(self, ticker):
        self.ticker = ticker
        self.prices = []
        self.weight = 0.0
    
    def set_prices(self, start_date, end_date):
        self.prices = get_info(self.ticker, start_date, end_date)
    