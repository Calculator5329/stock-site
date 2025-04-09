// components/TickerChartContainer.tsx
import React from "react";
import TickerChart from "./TickerChart";

interface Props {
  chartData: any;
  loading: boolean;
}

const TickerChartContainer: React.FC<Props> = ({ chartData, loading }) => {
  if (loading || !chartData) return null;

  return (
    <div
      className="mt-6 chart-wrapper"
      style={{
        padding: "1rem",
        backgroundColor: "#050505",
        borderRadius: "10px",
        border: "1px solid #333",
        height: "500px",
        width: "60%",
        display: "flex",
        alignItems: "left",
        justifyContent: "left",
        maxWidth: "1000px",
      }}
    >
      <TickerChart chartData={chartData} />
    </div>
  );
};

export default TickerChartContainer;
