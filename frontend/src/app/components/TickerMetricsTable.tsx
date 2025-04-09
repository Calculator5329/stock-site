import React from "react";

interface Props {
  tickerStats: Record<string, number[]> | null;
  tickerStatLabels: string[];
}

const TickerMetricsTable: React.FC<Props> = ({
  tickerStats,
  tickerStatLabels,
}) => {
  return (
    <div className="ticker-metrics-container">
      <h2 className="ticker-metrics-title">Individual Stock Metrics</h2>
      <table className="ticker-metrics-table">
        <thead>
          <tr>
            <th>Ticker</th>
            {tickerStatLabels?.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickerStats &&
            Object.entries(tickerStats).map(([ticker, stats]) => (
              <tr key={ticker}>
                <td className="ticker-label">{ticker}</td>
                {stats.map((val, i) => {
                  let formatted: string;
                  const label = tickerStatLabels?.[i] || ""; // fallback if label missing
                  const format = label.includes("Value")
                    ? "dollar"
                    : label.includes("Ratio")
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

                  return <td key={i}>{formatted}</td>;
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TickerMetricsTable;
