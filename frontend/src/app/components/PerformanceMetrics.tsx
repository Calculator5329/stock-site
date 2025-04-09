// components/PerformanceMetrics.tsx
import React from "react";

interface PerformanceMetricsProps {
  metrics: number[] | null;
  loading: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  loading,
}) => {
  const items = [
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
  ];

  return (
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
        {items.map(({ label, format, digits = 2 }, index) => {
          const value = metrics?.[index];
          let formatted: string;

          if (value === null || value === undefined || loading) {
            formatted = "—";
          } else if (format === "dollar") {
            formatted = `$${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          } else if (format === "percent") {
            formatted = isNaN(value)
              ? "—"
              : `${(value * 100).toFixed(digits)}%`;
          } else {
            formatted = isNaN(value) ? "—" : value.toFixed(digits);
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
  );
};

export default PerformanceMetrics;
