import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from functions.data import get_info

def get_ticker_values(tickers, start_date, end_date):
    ticker_values = {}
    for ticker in tickers:
        df = get_info(ticker, start_date, end_date, prices=False)

        series = df['Close'].dropna()
        normalized = (series / series.iloc[0]) * 100
        ticker_values[ticker] = normalized.tolist()
    
    return ticker_values
    