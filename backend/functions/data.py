import yfinance as yf
import pandas as pd
import time
import os
import requests

def get_info(ticker, start_date, end_date, prices=True):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_cache"))
    pkl_path = os.path.join(base_dir, f"{ticker}.pkl")
    csv_path = os.path.join(base_dir, f"{ticker}.csv")

    if os.path.exists(pkl_path):
        print(f"Loading {ticker} from pickle...")
        df = pd.read_pickle(pkl_path)
        if "Date" not in df.columns:
            raise ValueError(f"'Date' column missing in {ticker}. Columns: {df.columns.tolist()}")
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce", utc=True).dt.tz_convert(None)
        df = df.sort_values("Date").set_index("Date")
    elif os.path.exists(csv_path):
        # Fallback: load CSV if pickle doesn't exist.
        df = pd.read_csv(csv_path)
        if "Date" not in df.columns:
            raise ValueError(f"'Date' column missing in {ticker}. Columns: {df.columns.tolist()}")
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce", utc=True).dt.tz_convert(None)
        df = df.sort_values("Date").set_index("Date")
    else:
        raise FileNotFoundError(f"Cached file not found for ticker: {ticker}")

    # Convert input dates to naive datetime objects.
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

