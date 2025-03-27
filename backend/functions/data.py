import yfinance as yf
import pandas as pd
import time
import os
import requests


# Global cache dictionary
_data_cache = {}

def preload_ticker_data():
    global _data_cache
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_cache"))
    for filename in os.listdir(base_dir):
        if filename.endswith(".csv") and filename in ["AAPL.csv", "MSFT.csv", "GOOGL.csv", "META.csv", "AMZN.csv", "TSLA.csv"]:
            ticker = filename[:-4]  # remove the .csv extension
            path = os.path.join(base_dir, filename)
            try:
                df = pd.read_csv(path)
                if "Date" not in df.columns:
                    print(f"Skipping {ticker}—no Date column.")
                    continue
                df["Date"] = pd.to_datetime(df["Date"], errors="coerce", utc=True).dt.tz_convert(None)
                df = df.sort_values("Date").set_index("Date")
                _data_cache[ticker] = df
                print(f"Loaded {ticker} into cache.")
            except Exception as e:
                print(f"Error loading {ticker}: {e}")

def get_info(ticker, start_date, end_date, prices=True):
    global _data_cache

    # If the ticker is already cached, use it; otherwise, read and cache it.
    if ticker in _data_cache:
        df = _data_cache[ticker]
    else:
        path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data_cache", f"{ticker}.csv")
        )
        if not os.path.exists(path):
            raise FileNotFoundError(f"Cached file not found for ticker: {ticker} ({path})")

        df = pd.read_csv(path)
        if "Date" not in df.columns:
            raise ValueError(f"'Date' column missing in {ticker}. Columns: {df.columns.tolist()}")

        # Parse dates as UTC and then remove timezone info so they're naive
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce", utc=True).dt.tz_convert(None)
        df = df.sort_values("Date").set_index("Date")

        _data_cache[ticker] = df  # Cache the full DataFrame for later use

    # Convert input dates to naive datetime objects
    start_date = pd.to_datetime(start_date, utc=True).tz_convert(None)
    end_date = pd.to_datetime(end_date, utc=True).tz_convert(None)

    df_slice = df.loc[start_date:end_date]
    if df_slice.empty:
        raise ValueError(f"No data for {ticker} between {start_date} and {end_date}")

    return df_slice["Close"] if prices else df_slice
   

def plot_tickers_data(ticker_objects, normalize=False):
    data = {"dates": [], "stocks": {}}

    for ticker_obj in ticker_objects:
        series = ticker_obj.prices.dropna()

        if series.empty:
            continue

        if normalize:
            series = (series / series.iloc[0]) * 100

        if not data["dates"]:
            data["dates"] = [d.strftime("%Y-%m-%d") for d in series.index]

        data["stocks"][ticker_obj.ticker] = {
            "values": [round(v.item() if hasattr(v, "item") else float(v), 2) for v in series.values],
            "weight": ticker_obj.weight
        }

    return data


def get_latest_common_start(ticker_objects):
    start_dates = []

    for t in ticker_objects:
        prices = t.prices.dropna()
        if not prices.empty:
            start_dates.append(prices.index.min())

    if not start_dates:
        raise ValueError("No valid start dates found in ticker list.")

    latest_date = max(start_dates)
    return latest_date.strftime("%Y-%m-%d")


def plot_weighted_portfolio_data(ticker_objects):
    portfolio_df = pd.DataFrame()

    for t in ticker_objects:
        prices = t.prices.dropna()
        if prices.empty:
            continue

        normalized = (prices / prices.iloc[0]) * 100
        weighted = normalized * t.weight
        portfolio_df[t.ticker] = weighted

    portfolio_df.dropna(inplace=True)

    if portfolio_df.empty:
        raise ValueError("No overlapping data across tickers.")

    portfolio_df["Portfolio"] = portfolio_df.sum(axis=1)

    data = {
        "dates": [d.strftime("%Y-%m-%d") for d in portfolio_df.index],
        "portfolio": [round(float(v), 2) for v in portfolio_df["Portfolio"].values],
        "stocks": {}
    }

    for ticker in portfolio_df.columns[:-1]:
        data["stocks"][ticker] = {
            "values": [round(float(v), 2) for v in portfolio_df[ticker].values],
            "weight": next(t.weight for t in ticker_objects if t.ticker == ticker)
        }

    return data

