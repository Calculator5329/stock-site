"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const defaultTickers = [
  "GOOGL",
  "MSFT",
  "META",
  "AMZN",
  "TSLA",
  "AAPL",
  "DPZ",
  "COST",
  "DIS",
  "JPM",
  "ENPH",
  "FICO",
  "HD",
  "INTU",
  "KO",
  "MA",
  "MCD",
  "NKE",
  "NVDA",
  "PG",
  "PYPL",
  "SBUX",
  "SHOP",
  "TGT",
  "V",
  "WMT",
  "ZM",
];

export default function Home() {
  const [portfolio, setPortfolio] = useState([{ ticker: "MSFT", weight: 100 }]);
  const [startDate, setStartDate] = useState("2015-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initial, setInitial] = useState("1000");
  const [addition, setAddition] = useState("10");
  const [frequency, setFrequency] = useState("monthly");
  const [weightError, setWeightError] = useState("");
  const [data, setData] = useState<{
    dates: string[];
    portfolio: number[];
    data: number[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Create a ref for the ticker container
  const tickerContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when portfolio changes
  useEffect(() => {
    if (tickerContainerRef.current) {
      tickerContainerRef.current.scrollTop =
        tickerContainerRef.current.scrollHeight;
    }
  }, [portfolio]);

  const updateTicker = (i: number, key: string, value: string | number) => {
    const updated = [...portfolio];
    updated[i] = { ...updated[i], [key]: value };
    setPortfolio(updated);
  };

  const addTicker = () => {
    setPortfolio([...portfolio, { ticker: "AAPL", weight: 0 }]);
  };

  const removeTicker = (index: number) => {
    if (portfolio.length > 1) {
      const updated = [...portfolio];
      updated.splice(index, 1);
      setPortfolio(updated);
    }
  };

  /* Equal weights
  // Set equal weights for all but the last ticker
      const equalWeight = Math.round(100 / portfolio.length);
      const updatedPortfolio = portfolio.map((entry, i) => {
        // For all items except the last one, set to equal weight
        if (i < portfolio.length - 1) {
          return { ...entry, weight: equalWeight };
        }
        // Calculate the last weight to ensure total is exactly 100
        const weightSum = equalWeight * (portfolio.length - 1);
        return { ...entry, weight: 100 - weightSum };
      });
      setPortfolio(updatedPortfolio);
  */

  const submit = async () => {
    setLoading(true);
    // Check that ticker weights add up to exactly 100
    const totalWeight = portfolio.reduce((sum, entry) => sum + entry.weight, 0);
    if (Math.round(totalWeight * 100) / 100 !== 100) {
      setWeightError("Ticker weights must add up to 100%. Please try again.");
      setLoading(false);
      return;
    } else {
      setWeightError("");
    }
    const portfolioDict: Record<string, number> = {};
    portfolio.forEach(({ ticker, weight }) => {
      // Use an explicit check to allow weight = 0
      if (ticker && weight !== undefined && weight !== null) {
        portfolioDict[ticker] = Number(weight) / 100;
      }
    });

    const res = await fetch("http://192.168.1.241:8000/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolio: portfolioDict,
        start_date: startDate,
        end_date: endDate,
        initial: Number(initial), // Convert to number
        addition: Number(addition), // Convert to number
        frequency,
      }),
    });

    const json = await res.json();
    console.log(json);
    setData(json);
    setLoading(false);
  };

  return (
    <main>
      <div className="top-bar">
        <a
          href="https://Calculator5329.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="avatar-link"
        >
          <div className="profile-avatar">
            <Image src="/profile.png" alt="Me" fill />
          </div>
        </a>
        {/* Top title */}
        <h1 className="top-title">Portfolio Backtest</h1>
      </div>

      {/* Two-column layout for details and ticker selection */}
      <div className="portfolio-container">
        {/* Left Column: Portfolio Details */}
        <div className="portfolio-form">
          <h2 className="sub-title">Portfolio Options</h2>
          <div className="input-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Initial Investment ($)</label>
              <input
                type="number"
                min={0}
                max={10000000}
                value={initial}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setInitial("");
                    return;
                  }
                  let num = parseFloat(val);
                  if (isNaN(num)) {
                    setInitial("");
                  } else {
                    num = Math.max(0, Math.min(10000000, num));
                    setInitial(num.toString());
                  }
                }}
                placeholder="(e.g. 1000)"
              />
            </div>
            <div className="form-group">
              <label>Recurring Amount ($)</label>
              <input
                type="number"
                min={0}
                max={10000000}
                value={addition}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setAddition("");
                    return;
                  }
                  let num = parseFloat(val);
                  if (isNaN(num)) {
                    setAddition("");
                  } else {
                    num = Math.max(0, Math.min(10000000, num));
                    setAddition(num.toString());
                  }
                }}
                placeholder="(e.g. 100)"
              />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <button onClick={submit} className="submit-btn" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>

        {/* Right Column: Ticker Selection */}
        <div className="ticker-selection" ref={tickerContainerRef}>
          <h2 className="sub-title">Portfolio</h2>
          {portfolio.map((entry, i) => (
            <div
              key={i}
              className="form-group"
              style={{
                display: "flex",
                gap: "1.5rem",
                marginBottom: "0.5rem",
                borderRadius: "10px",
                padding: "1rem",
              }}
            >
              <select
                value={entry.ticker}
                onChange={(e) => updateTicker(i, "ticker", e.target.value)}
                className="input-field"
              >
                {defaultTickers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Wrap the number input and % symbol together */}
              <div style={{ position: "relative", margin: 0, padding: 0 }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={entry.weight}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      updateTicker(i, "weight", 0);
                    } else {
                      updateTicker(
                        i,
                        "weight",
                        Math.max(0, Math.min(100, value))
                      );
                    }
                  }}
                  className="input-field"
                  style={{ paddingRight: "2rem", margin: 0 }}
                  placeholder="%"
                />
                <span
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#999",
                  }}
                >
                  %
                </span>
              </div>
              {/* Only show the remove button if more than one ticker */}
              {portfolio.length > 1 && (
                <button
                  onClick={() => removeTicker(i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    fontSize: "1.5rem",
                    pointerEvents: "auto",
                  }}
                  aria-label="Remove ticker"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
          {weightError && (
            <p style={{ color: "red", margin: 0, fontSize: "0.875rem" }}>
              {weightError}
            </p>
          )}
          <button onClick={addTicker} className="submit-btn">
            Add Ticker
          </button>
        </div>
      </div>
      <div className="output_container">
        {data && (
          <div
            className="mt-6"
            style={{
              padding: "1rem",
              backgroundColor: "#050505",
              borderRadius: "10px",
              border: "1px solid #eaeaea",
              paddingLeft: "5rem",
              paddingRight: "5rem",
              height: "640px",
              width: "70%",
            }}
          >
            <Line
              data={{
                labels: data.dates,
                datasets: [
                  {
                    label: "Portfolio Value Over Time",
                    data: data.portfolio,
                    fill: false,
                    borderColor: "rgb(76, 148, 76)",
                    tension: 0.1,
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: false,
                    text: "Portfolio Performance Over Time",
                  },
                },
                scales: {
                  y: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      callback: (value) => "$" + value,
                    },
                  },
                  x: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                  },
                },
              }}
            />
          </div>
        )}

        {data?.data && (
          <div className="portfolio-detail">
            <h2
              style={{
                margin: 0,
                padding: "1rem 1.5rem",
                fontSize: "1.25rem",
                borderBottom: "1px solid #333",
                backgroundColor: "#181818",
              }}
            >
              Performance Metrics
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                fontSize: "0.95rem",
              }}
            >
              {[
                { label: "Initial Value", format: "dollar" },
                { label: "Ending Value", format: "dollar" },
                { label: "Total Return", format: "percent" },
                { label: "CAGR", format: "percent" },
                { label: "Annualized Std Dev", format: "percent" },
                { label: "Best Year Return", format: "percent" },
                { label: "Worst Year Return", format: "percent" },
                { label: "Maximum Drawdown", format: "percent" },
                { label: "Sharpe Ratio", format: "number" },
                { label: "Sortino Ratio", format: "number" },
                { label: "Total Contributions", format: "dollar" },
                { label: "MWRR", format: "percent" },
              ].map(({ label, format }, index) => {
                const value = data.data[index];
                let formatted: string;

                if (format === "dollar") {
                  formatted = `$${Number(value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`;
                } else if (format === "percent") {
                  formatted = isNaN(value)
                    ? "N/A"
                    : `${(value * 100).toFixed(2)}%`;
                } else {
                  formatted = isNaN(value) ? "N/A" : value.toFixed(4);
                }

                return (
                  <li
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: index % 2 === 0 ? "#181818" : "#151515",
                      borderBottom: "1px solid #222",
                    }}
                  >
                    <span style={{ color: "#aaa" }}>{label}</span>
                    <span style={{ color: "#eee", fontWeight: 500 }}>
                      {formatted}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
