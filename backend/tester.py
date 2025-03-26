from datetime import datetime
from functions.data import get_info, plot_tickers_data, plot_weighted_portfolio_data, get_latest_common_start

class TickerObject:
    def __init__(self, ticker, start, end, weight):
        self.ticker = ticker
        self.weight = weight
        self.prices = get_info(ticker, start, end)

# Setup test params
start_date = "2022-01-01"
end_date = "2023-01-01"
tickers = [
    ("AAPL", 0.4),
    ("MSFT", 0.3),
    ("GOOGL", 0.3)
]

# Create TickerObject list
ticker_objects = []
for symbol, weight in tickers:
    try:
        ticker_objects.append(TickerObject(symbol, start_date, end_date, weight))
    except Exception as e:
        print(f"Error loading {symbol}: {e}")

# Run tests
print("=== Latest Common Start ===")
print(get_latest_common_start(ticker_objects))

print("\n=== Plot Tickers Data ===")
print(plot_tickers_data(ticker_objects, normalize=True))

print("\n=== Plot Weighted Portfolio ===")
print(plot_weighted_portfolio_data(ticker_objects))
