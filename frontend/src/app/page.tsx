"use client";

import React, { useState, useEffect, useRef } from "react";
import TopBar from "./components/TopBar";
import PortfolioForm from "./components/PortfolioForm";
import TickerList from "./components/TickerList";
import PortfolioChartContainer from "./components/PortfolioChartContainer";
import TickerChartContainer from "./components/TickerChartContainer";
import PerformanceMetrics from "./components/PerformanceMetrics";
import TickerMetricsTable from "./components/TickerMetricsTable";
import { ChartData } from "chart.js";

const backURL = "http://localhost:80";

const defaultTickers = [
  "MSFT",
  "META",
  "AAPL",
  "AMZN",
  "GOOGL",
  "TSLA",
  "NFLX",
];
const tickerStatLabels = [
  "CAGR",
  "Annualized Std Dev",
  "Best Year Return",
  "Worst Year Return",
  "Maximum Drawdown",
  "Sharpe Ratio",
  "Sortino Ratio",
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

  interface PortfolioData {
    dates: string[];
    portfolio: number[];
    raw: number[];
    data: number[];
    ticker_values?: Record<string, number[]>;
  }
  const [data, setData] = useState<PortfolioData | null>(null);
  const [secondChart, setSecondChart] = useState<ChartData<"line"> | null>(
    null
  );

  const [tickerStats, setTickerStats] = useState<Record<
    string,
    number[]
  > | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingTickers, setLoadingTickers] = useState(false);
  const [syncedScales, setSyncedScales] = useState<{
    y1Min: number;
    y1Max: number;
    y2Min: number;
    y2Max: number;
  } | null>(null);

  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const prevPortfolioLength = useRef(portfolio.length);

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

  useEffect(() => {
    submitPortfolio();
  }, []);

  useEffect(() => {
    if (data?.dates && data.dates.length > 0) {
      fetchTickerChart(data.dates);
    }
  }, [data, startDate, endDate]);

  const handleSubmitClick = () => {
    submitPortfolio();
  };

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

  const submitPortfolio = async () => {
    setLoadingPortfolio(true);
    setLoadingTickers(false);
    setWeightError("");

    // Check that ticker weights add up to exactly 100
    const totalWeight = portfolio.reduce(
      (sum, entry) => sum + (Number(entry.weight) || 0),
      0
    );
    if (Math.round(totalWeight) !== 100) {
      setWeightError("Ticker weights must add up to 100%");
      setLoadingPortfolio(false);
      return;
    }

    const portfolioDict: Record<string, number> = {};
    portfolio.forEach(({ ticker, weight }) => {
      if (ticker && Number(weight) >= 0) {
        portfolioDict[ticker] = Number(weight) / 100;
      }
    });

    if (Object.keys(portfolioDict).length === 0) {
      setWeightError("Portfolio is empty or invalid.");
      setLoadingPortfolio(false);
      return;
    }

    try {
      const res = await fetch(`${backURL}/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: portfolioDict,
          start_date: startDate,
          end_date: endDate,
          initial: Number(initial) || 0,
          addition: Number(addition) || 0,
          frequency,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (!json || !json.dates || !json.portfolio || !json.raw || !json.data) {
        throw new Error("Received invalid portfolio data.");
      }

      // ✅ Only clear previous data *after* we know we got valid new data
      setData(json);
      setSecondChart(null);
      setSyncedScales(computeSyncedScales(json.portfolio, json.raw));
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      setWeightError(
        `Failed to load portfolio data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      // ❌ Don't wipe previous data anymore here!
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const fetchTickerChart = async (dates: string[]) => {
    setLoadingTickers(true);
    setSecondChart(null);

    const tickers = portfolio.map((p) => p.ticker).filter(Boolean);
    try {
      const res = await fetch(`${backURL}/ticker_chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickers,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const json = await res.json();
      setSecondChart(buildSecondChart(json.tickerVals, dates));
      setTickerStats(json.tickerStats);
    } catch (err) {
      console.error("Ticker chart fetch error:", err);
    } finally {
      setLoadingTickers(false);
    }
  };

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

    return {
      labels: dates,
      datasets: Object.keys(tickerValues).map((ticker, i) => ({
        label: ticker,
        data: tickerValues[ticker],
        borderColor: colors[i % colors.length],
        fill: false,
        tension: 0.2,
        pointRadius: 0,
      })),
    };
  };

  const computeSyncedScales = (p: number[], r: number[]) => {
    if (!p.length || !r.length || p[0] === 0 || r[0] === 0) return null;

    const y1RatioMin = Math.min(...p) / p[0];
    const y1RatioMax = Math.max(...p) / p[0];
    const y2RatioMin = Math.min(...r) / r[0];
    const y2RatioMax = Math.max(...r) / r[0];

    const y1RawMin = Math.min(y1RatioMin, y2RatioMin) * p[0];
    const y1RawMax = Math.max(y1RatioMax, y2RatioMax) * p[0];

    const oom = Math.log10(Math.max(...p));
    const round = Math.pow(10, Math.ceil(oom - 1));
    const y1Min = Math.floor(y1RawMin / round) * round;
    const y1Max = Math.ceil(y1RawMax / round) * round;
    const y2Min = Math.round((y1Min / p[0]) * r[0]);
    const y2Max = Math.round((y1Max / p[0]) * r[0]);

    return { y1Min, y1Max, y2Min, y2Max };
  };

  return (
    <main>
      <TopBar />
      <div className="portfolio-container">
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

      <div className="output_container">
        <PortfolioChartContainer
          labels={data?.dates ?? []}
          portfolio={data?.portfolio ?? []}
          raw={data?.raw ?? []}
          syncedScales={syncedScales}
          loading={loadingPortfolio}
        />
        <PerformanceMetrics
          metrics={data?.data ?? null}
          loading={loadingPortfolio}
        />
      </div>

      <div
        className="output_container ticker-chart-container"
        style={{ marginTop: "2rem" }}
      >
        <TickerChartContainer
          chartData={secondChart}
          loading={loadingTickers}
        />
        <TickerMetricsTable
          tickerStats={tickerStats}
          tickerStatLabels={tickerStatLabels}
        />
      </div>
    </main>
  );
}
