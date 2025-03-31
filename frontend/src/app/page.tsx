"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import Image from "next/image";

import TickerChart from "./components/TickerChart";
import PortfolioChart from "./components/PortfolioChart";
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
  "MSFT",
  "META",
  "AAPL",
  "AMZN",
  "GOOGL",
  "TSLA",
  "NFLX",
];

export default function Home() {
  const [portfolio, setPortfolio] = useState([
    { ticker: "META", weight: 33 },
    { ticker: "AMZN", weight: 33 },
    { ticker: "GOOGL", weight: 34 },
  ]);
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [initial, setInitial] = useState("1000");
  const [addition, setAddition] = useState("10");
  const [frequency, setFrequency] = useState("monthly");
  const [weightError, setWeightError] = useState("");
  const [secondChart, setSecondChart] = useState<any>(null); // Data for TickerChart
  const [data, setData] = useState<{
    // Data for PortfolioChart and metrics
    dates: string[];
    portfolio: number[];
    data: number[];
    raw: number[];
    ticker_values: Record<string, number[]>; // Note: ticker_values might be redundant if fetched separately
  } | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false); // Loading state for the first chart
  const [loadingTickers, setLoadingTickers] = useState(false); // Optional: Loading state for the second chart

  // Ticker values state is still needed if you want to access it elsewhere,
  // but it's fetched within fetchTickerChart now.
  // const [tickerValues, setTickerValues] = useState<Record<string, number[]>> | null>(null);

  const [syncedScales, setSyncedScales] = useState<{
    y1Min: number;
    y1Max: number;
    y2Min: number;
    y2Max: number;
  } | null>(null);

  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const prevPortfolioLength = useRef(portfolio.length);

  // Scroll ticker list
  useEffect(() => {
    if (
      tickerContainerRef.current &&
      portfolio.length !== prevPortfolioLength.current
    ) {
      tickerContainerRef.current.scrollTop =
        tickerContainerRef.current.scrollHeight;
      prevPortfolioLength.current = portfolio.length;
    }
  }, [portfolio.length]);

  // Initial load on mount
  useEffect(() => {
    submitPortfolio(); // Renamed submit to be more specific
  }, []);

  // --- Fetch Ticker Chart Logic ---
  // This function now fetches and sets the state for the second chart.
  const fetchTickerChart = async (dates: string[]) => {
    if (!portfolio || portfolio.length === 0 || !dates || dates.length === 0) {
      console.log("Skipping ticker chart fetch: Missing data.");
      setSecondChart(null); // Clear any previous chart
      return;
    }

    setLoadingTickers(true); // Start loading indicator for second chart
    setSecondChart(null); // Clear previous chart while loading new one

    const tickers = portfolio.map((p) => p.ticker).filter(Boolean);
    if (tickers.length === 0) {
      console.log("Skipping ticker chart fetch: No valid tickers.");
      setLoadingTickers(false);
      return;
    }

    try {
      const res = await fetch(
        "https://portfoliobackend5329.azurewebsites.net/ticker_chart",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tickers,
            start_date: startDate, // Use component state for dates
            end_date: endDate, // Use component state for dates
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: Record<string, number[]> = await res.json();
      // setTickerValues(json); // You might still want this if used elsewhere
      const chartData = buildSecondChart(json, dates);
      setSecondChart(chartData);
    } catch (error) {
      console.error("Failed to fetch ticker chart:", error);
      setSecondChart(null); // Clear chart on error
    } finally {
      setLoadingTickers(false); // Stop loading indicator for second chart
    }
  };

  // --- useEffect to trigger Ticker Chart fetch AFTER Portfolio data is loaded ---
  useEffect(() => {
    if (data?.dates && data.dates.length > 0) {
      console.log("Portfolio data loaded, triggering ticker chart fetch.");
      fetchTickerChart(data.dates);
    }
  }, [data, startDate, endDate]);

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

  // Builds the data structure needed for Chart.js for the TickerChart
  const buildSecondChart = (
    tickerValues: Record<string, number[]>,
    dates: string[]
  ) => {
    const colors = [
      "#4e79a7",
      "#f28e2b",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc949",
      "#af7aa1",
      "#ff9da7",
      "#9c755f",
      "#bab0ab",
    ];
    const tickers = Object.keys(tickerValues);

    const datasets = tickers.map((ticker, i) => ({
      label: ticker,
      data: tickerValues[ticker],
      borderColor: colors[i % colors.length],
      fill: false,
      tension: 0.2,
      pointRadius: 0,
    }));

    return {
      labels: dates,
      datasets,
    };
  };

  const computeSyncedScales = (portfolioVals: number[], rawVals: number[]) => {
    if (
      !portfolioVals ||
      portfolioVals.length === 0 ||
      !rawVals ||
      rawVals.length === 0
    ) {
      return null; // Not enough data
    }
    // Protect against division by zero or invalid data
    if (portfolioVals[0] === 0 || rawVals[0] === 0) {
      console.warn(
        "Initial value is zero, cannot compute synced scales reliably."
      );
      // Fallback to independent scaling or default range
      const y1Min = Math.min(...portfolioVals);
      const y1Max = Math.max(...portfolioVals);
      const y2Min = Math.min(...rawVals);
      const y2Max = Math.max(...rawVals);
      // Basic rounding logic
      const y1oom = Math.log10(Math.max(1, y1Max)); // Use 1 if max is 0 or less
      const y1round = Math.pow(10, Math.max(0, Math.ceil(y1oom - 1)));
      const y2oom = Math.log10(Math.max(1, y2Max));
      const y2round = Math.pow(10, Math.max(0, Math.ceil(y2oom - 1)));

      return {
        y1Min: Math.floor(y1Min / y1round) * y1round,
        y1Max: Math.ceil(y1Max / y1round) * y1round,
        y2Min: Math.floor(y2Min / y2round) * y2round,
        y2Max: Math.ceil(y2Max / y2round) * y2round,
      };
    }

    const y1Values = portfolioVals;
    const y2Values = rawVals;

    const ooms = Math.log10(Math.max(...y1Values));
    const round_val = Math.pow(10, Math.ceil(ooms - 1));

    const y1RatioMin = Math.min(...y1Values) / y1Values[0];
    const y1RatioMax = Math.max(...y1Values) / y1Values[0];

    const y2RatioMin = Math.min(...y2Values) / y2Values[0];
    const y2RatioMax = Math.max(...y2Values) / y2Values[0];

    const y1RawMin = Math.min(y1RatioMin, y2RatioMin) * y1Values[0];
    const y1RawMax = Math.max(y1RatioMax, y2RatioMax) * y1Values[0];

    const y1Max = Math.ceil(y1RawMax / round_val) * round_val;
    const y1Min = Math.floor(y1RawMin / round_val) * round_val;

    const y2Min = Math.round((y1Min / y1Values[0]) * y2Values[0]);
    const y2Max = Math.round((y1Max / y1Values[0]) * y2Values[0]);

    return { y1Min, y1Max, y2Min, y2Max };
  };

  // Renamed to clarify it fetches portfolio data
  const submitPortfolio = async () => {
    setLoadingPortfolio(true); // Start loading for portfolio
    setLoadingTickers(false); // Ensure ticker loading is off initially
    setData(null); // Clear previous portfolio data
    setSecondChart(null); // Clear previous ticker chart data
    setSyncedScales(null); // Clear previous scales
    setWeightError(""); // Clear previous errors

    // Check that ticker weights add up to exactly 100
    const totalWeight = portfolio.reduce(
      (sum, entry) => sum + (Number(entry.weight) || 0),
      0
    );
    if (Math.round(totalWeight) !== 100) {
      // Simplified check
      setWeightError("Ticker weights must add up to 100%. Please try again.");
      setLoadingPortfolio(false);
      return;
    }

    const portfolioDict: Record<string, number> = {};
    portfolio.forEach(({ ticker, weight }) => {
      if (
        ticker &&
        weight !== undefined &&
        weight !== null &&
        Number(weight) >= 0
      ) {
        // Allow 0 weight
        portfolioDict[ticker] = Number(weight) / 100;
      }
    });

    // Ensure there's actually something in the portfolio to fetch
    if (Object.keys(portfolioDict).length === 0) {
      setWeightError(
        "Portfolio is empty or contains no valid tickers with weights."
      );
      setLoadingPortfolio(false);
      return;
    }

    try {
      const res = await fetch(
        "https://portfoliobackend5329.azurewebsites.net/portfolio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio: portfolioDict,
            start_date: startDate,
            end_date: endDate,
            initial: Number(initial) || 0, // Default to 0 if empty/invalid
            addition: Number(addition) || 0, // Default to 0 if empty/invalid
            frequency,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      console.log("Portfolio Data Received:", json);

      // Basic validation of received data
      if (!json || !json.dates || !json.portfolio || !json.raw || !json.data) {
        throw new Error(
          "Received invalid data structure from portfolio endpoint."
        );
      }

      setData(json); // This state change will trigger the useEffect for the ticker chart
      const scales = computeSyncedScales(json.portfolio, json.raw);
      setSyncedScales(scales);
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      setData(null); // Clear data on error
      setWeightError(
        `Failed to load portfolio data: ${
          error instanceof Error ? error.message : String(error)
        }`
      ); // Show error
    } finally {
      setLoadingPortfolio(false); // Stop loading indicator for portfolio fetch
    }
  };

  // Call this function when the submit button is clicked
  const handleSubmitClick = () => {
    submitPortfolio();
  };

  return (
    <main>
      {/* ... (Top Bar JSX remains the same) ... */}
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
        <h1 className="top-title">Portfolio Backtest</h1>
      </div>

      {/* ... (Portfolio Container JSX remains the same, but use handleSubmitClick for the button) ... */}
      <div className="portfolio-container">
        {/* Left Column: Portfolio Details */}
        <div className="portfolio-form">
          <h2 className="sub-title">Portfolio Options</h2>
          <div className="input-row">
            {/* Start Date */}
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                min="1970-01-01"
                max="2024-12-31" // Consider making max dynamic or removing it
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {/* End Date */}
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                min="1970-01-01"
                max="2024-12-31" // Consider making max dynamic or removing it
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {/* Initial Investment */}
            <div className="form-group">
              <label>Initial Investment ($)</label>
              <input
                type="number"
                min={0}
                max={10000000}
                value={initial}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty string, otherwise validate and clamp
                  if (val === "") {
                    setInitial("");
                  } else {
                    let num = parseFloat(val);
                    if (!isNaN(num)) {
                      num = Math.max(0, Math.min(10000000, num));
                      setInitial(num.toString());
                    } else {
                      // Handle case where input becomes non-numeric temporarily
                      // Maybe set to "0" or keep the previous valid value?
                      // For now, setting to empty allows correction.
                      setInitial("");
                    }
                  }
                }}
                placeholder="(e.g. 1000)"
              />
            </div>
            {/* Recurring Amount */}
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
                  } else {
                    let num = parseFloat(val);
                    if (!isNaN(num)) {
                      num = Math.max(0, Math.min(10000000, num));
                      setAddition(num.toString());
                    } else {
                      setAddition("");
                    }
                  }
                }}
                placeholder="(e.g. 100)"
              />
            </div>
            {/* Frequency */}
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
          {/* Submit Button */}
          <button
            onClick={handleSubmitClick}
            className="submit-btn"
            disabled={loadingPortfolio || loadingTickers}
          >
            {loadingPortfolio
              ? "Loading Portfolio..."
              : loadingTickers
              ? "Loading Tickers..."
              : "Submit"}
          </button>
          {weightError && (
            <p
              style={{ color: "red", marginTop: "1rem", fontSize: "0.875rem" }}
            >
              {weightError}
            </p>
          )}
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
              <input
                list="ticker-options"
                value={entry.ticker}
                onChange={(e) => updateTicker(i, "ticker", e.target.value)}
                className="input-field"
                placeholder="Search ticker..."
              />
              <datalist id="ticker-options">
                {defaultTickers.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>

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

      {/* Output Container */}
      <div className="output_container">
        <div
          className="mt-6 chart-wrapper"
          style={{
            padding: "1rem",
            backgroundColor: "#050505",
            borderRadius: "10px",
            border: "1px solid #333",
            height: "640px",
            width: "calc(70% - 1rem)",
            marginRight: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data && !loadingPortfolio ? (
            <PortfolioChart
              chartData={{
                labels: data.dates,
                datasets: [
                  {
                    label: "Portfolio Value",
                    data: data.portfolio,
                    borderColor: "rgb(76, 148, 76)",
                    pointRadius: 0,
                    tension: 0.1,
                    fill: false,
                    yAxisID: "y1",
                  },
                  {
                    label: "Growth of Initial Investment",
                    data: data.raw,
                    borderColor: "rgb(116, 116, 116)",
                    pointRadius: 0,
                    tension: 0.1,
                    fill: false,
                    yAxisID: "y2",
                  },
                ],
              }}
              syncedScales={syncedScales}
            />
          ) : null}
        </div>

        {/* Performance Metrics Section */}
        <div
          className="portfolio-detail"
          style={{
            width: "calc(30% - 1rem)",
            backgroundColor: "#101010",
            borderRadius: "10px",
            border: "1px solid #333",
            overflow: "hidden",
            height: "640px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              margin: 0,
              padding: "1rem 1.5rem",
              fontSize: "1.1rem",
              borderBottom: "1px solid #333",
              backgroundColor: "#181818",
              color: "#eee",
              flexShrink: 0,
            }}
          >
            Performance Metrics
          </h2>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              fontSize: "0.9rem",
              overflowY: "auto",
              flexGrow: 1,
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
              { label: "Sharpe Ratio", format: "number", digits: 2 },
              { label: "Sortino Ratio", format: "number", digits: 2 },
              { label: "Total Contributions", format: "dollar" },
              { label: "MWRR", format: "percent" },
            ].map(({ label, format, digits = 2 }, index) => {
              const value = data?.data?.[index];
              let formatted: string;

              if (value === null || value === undefined || loadingPortfolio) {
                formatted = "—";
              } else if (format === "dollar") {
                formatted = `$${Number(value).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              } else if (format === "percent") {
                formatted = isNaN(value)
                  ? "—"
                  : `${(Number(value) * 100).toFixed(digits)}%`;
              } else {
                formatted = isNaN(value) ? "—" : Number(value).toFixed(digits);
              }

              return (
                <li
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 1.5rem",
                    backgroundColor: index % 2 === 0 ? "#181818" : "#151515",
                    borderBottom: "1px solid #282828",
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
      </div>

      {/* Second Chart Container (appears below the first row) */}
      {/* Check if the second chart data is ready */}
      <div
        className="output_container ticker-chart-container"
        style={{ marginTop: "2rem" }}
      >
        <div
          className="mt-6 chart-wrapper"
          style={{
            padding: "1rem",
            backgroundColor: "#050505",
            borderRadius: "10px",
            border: "1px solid #333",
            height: "500px",
            width: "fit-content",
            display: "flex",
            alignItems: "left",
            justifyContent: "left",
          }}
        >
          {secondChart && !loadingTickers ? (
            <TickerChart chartData={secondChart} />
          ) : null}
        </div>
        <div
          className="portfolio-detail"
          style={{
            backgroundColor: "#101010",
            borderRadius: "10px",
            border: "1px solid #333",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "515px",
          }}
        >
          <h1 style={{ paddingLeft: "15px" }}>
            Working on adding this section!
          </h1>
          <p style={{ paddingLeft: "15px" }}>
            This section will likely contain metrics such as Individual Stock
            Performance, Sharpe/Sortino Ratios, Drawdowns, and others.
          </p>
        </div>
      </div>
    </main>
  );
}
