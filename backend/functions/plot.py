import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

def plot_json_chart(data_dict, title="Chart"):
    plt.figure(figsize=(14, 6), dpi=120)
    plt.clf()

    dates = pd.to_datetime(data_dict["dates"])

    # Plot portfolio if it exists
    if "portfolio" in data_dict:
        plt.plot(dates, data_dict["portfolio"], label="Portfolio", linewidth=2)

    if "stocks" in data_dict:
        for ticker, info in data_dict["stocks"].items():
            if len(info["values"]) != len(dates):
                print(f"Skipping {ticker}: mismatched date/value length.")
                continue
            label = f"{ticker} ({info['weight']*100:.0f}%)"
            plt.plot(dates, info["values"], label=label, linestyle="--", alpha=0.7)

    plt.title(title)
    plt.xlabel("Date")
    plt.ylabel("Value")

    # Clean up x-axis
    ax = plt.gca()
    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
    plt.xticks(rotation=45)

    # Use light horizontal grid only
    plt.grid(True, which='major', axis='y', linestyle='--', alpha=0.5)
    ax.grid(False, axis='x')  # kill vertical bars

    plt.legend()
    plt.tight_layout()
    plt.show()
