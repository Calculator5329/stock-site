"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import PortfolioForm from "./components/PortfolioForm";
import TopBar from "./components/TopBar";
import PerformanceMetrics from "./components/PerformanceMetrics";
import TickerList from "./components/TickerList";
import PortfolioChartContainer from "./components/PortfolioChartContainer";
import TickerChartContainer from "./components/TickerChartContainer";
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
  const [tickerStats, setTickerStats] = useState<Record<
    string,
    number[]
  > | null>(null);
  const tickerStatLabels = [
    "CAGR",
    "Annualized Std Dev",
    "Best Year Return",
    "Worst Year Return",
    "Maximum Drawdown",
    "Sharpe Ratio",
    "Sortino Ratio",
  ];
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

  const tickerContainerRef = useRef<HTMLDivElement | null>(null);
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

    // "https://portfoliobackend5329.azurewebsites.net/ticker_chart"

    try {
      const res = await fetch("http://localhost:80/ticker_chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickers,
          start_date: startDate, // Use component state for dates
          end_date: endDate, // Use component state for dates
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      if ("error" in json) {
        throw new Error(json.error);
      }

      if ("error" in json) {
        throw new Error(json.error);
      }

      console.log("Ticker Chart Data Received:", json);

      // Destructure properly
      const { tickerVals, tickerStats } = json;

      const chartData = buildSecondChart(tickerVals, dates);
      setSecondChart(chartData);
      setTickerStats(tickerStats);
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

    // "https://portfoliobackend5329.azurewebsites.net/portfolio"

    try {
      const res = await fetch("http://localhost:80/portfolio", {
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
      });

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
      <TopBar />

      {/* ... (Portfolio Container JSX remains the same, but use handleSubmitClick for the button) ... */}
      <div className="portfolio-container">
        {/* Left Column: Portfolio Details */}
        <PortfolioForm
          startDate={startDate}
          endDate={endDate}
          initial={initial}
          addition={addition}
          frequency={frequency}
          weightError={weightError}
          loadingPortfolio={loadingPortfolio}
          loadingTickers={loadingTickers}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setInitial={setInitial}
          setAddition={setAddition}
          setFrequency={setFrequency}
          onSubmit={handleSubmitClick}
        />

        {/* Right Column: Ticker Selection */}
        <TickerList
          portfolio={portfolio}
          defaultTickers={defaultTickers}
          tickerContainerRef={tickerContainerRef}
          updateTicker={updateTicker}
          addTicker={addTicker}
          removeTicker={removeTicker}
          weightError={weightError}
        />
      </div>

      {/* Output Container */}
      <div className="output_container">
        <PortfolioChartContainer
          labels={data?.dates ?? []}
          portfolio={data?.portfolio ?? []}
          raw={data?.raw ?? []}
          syncedScales={syncedScales}
          loading={loadingPortfolio}
        />

        {/* Performance Metrics Section */}
        <PerformanceMetrics
          metrics={data?.data ?? null}
          loading={loadingPortfolio}
        />
      </div>

      {/* Second Chart Container (appears below the first row) */}
      {/* Check if the second chart data is ready */}
      <div
        className="output_container ticker-chart-container"
        style={{ marginTop: "2rem" }}
      >
        <TickerChartContainer
          chartData={secondChart}
          loading={loadingTickers}
        />

        <div
          className="portfolio-detail"
          style={{
            backgroundColor: "#101010",
            borderRadius: "10px",
            border: "1px solid #333",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "500px",
            padding: "1rem",
            width: "40%",
          }}
        >
          <h2 style={{ marginBottom: "1rem", color: "#eee" }}>
            Ticker Metrics
          </h2>
          <table
            style={{
              width: "100%",
              color: "#ccc",
              fontSize: "0.9rem",
              borderCollapse: "collapse",
              border: "1px solid #444", // Outer border
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.5rem",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                  }}
                >
                  Ticker
                </th>
                {tickerStatLabels.map((label) => (
                  <th
                    key={label}
                    style={{
                      textAlign: "right",
                      padding: "0.5rem",
                      border: "1px solid #444",
                      backgroundColor: "#181818",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickerStats &&
                Object.entries(tickerStats).map(([ticker, stats]) => (
                  <tr key={ticker}>
                    <td
                      style={{
                        fontWeight: 500,
                        padding: "0.5rem",
                        border: "1px solid #333",
                      }}
                    >
                      {ticker}
                    </td>
                    {stats.map((val, i) => {
                      let formatted: string;
                      const format = tickerStatLabels[i].includes("Value")
                        ? "dollar"
                        : tickerStatLabels[i].includes("Ratio")
                        ? "number"
                        : "percent";

                      if (val === null || val === undefined || isNaN(val)) {
                        formatted = "—";
                      } else if (format === "dollar") {
                        formatted = `$${val.toFixed(2)}`;
                      } else if (format === "percent") {
                        formatted = `${(val * 100).toFixed(2)}%`;
                      } else {
                        formatted = val.toFixed(2);
                      }

                      return (
                        <td
                          key={i}
                          style={{
                            textAlign: "right",
                            padding: "0.5rem",
                            border: "1px solid #333",
                          }}
                        >
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
