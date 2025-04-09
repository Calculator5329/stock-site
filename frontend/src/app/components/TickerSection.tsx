import React from "react";
import TickerChartContainer from "./TickerChartContainer";

interface Props {
  chartData: any;
  loading: boolean;
  tickerStats: Record<string, number[]> | null;
  tickerStatLabels: string[];
}

const TickerSection: React.FC<Props> = ({
  chartData,
  loading,
  tickerStats,
  tickerStatLabels,
}) => {
  return (
    <div
      className="output_container ticker-chart-container"
      style={{ marginTop: "2rem" }}
    >
      <TickerChartContainer chartData={chartData} loading={loading} />

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
        <h2 style={{ marginBottom: "1rem", color: "#eee" }}>Ticker Metrics</h2>
        <table
          style={{
            width: "100%",
            color: "#ccc",
            fontSize: "0.9rem",
            borderCollapse: "collapse",
            border: "1px solid #444",
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
  );
};

export default TickerSection;
