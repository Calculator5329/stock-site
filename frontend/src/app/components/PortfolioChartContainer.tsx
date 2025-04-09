// components/PortfolioChartContainer.tsx
import React from "react";
import PortfolioChart from "./PortfolioChart";

interface Props {
  labels: string[];
  portfolio: number[];
  raw: number[];
  syncedScales: {
    y1Min: number;
    y1Max: number;
    y2Min: number;
    y2Max: number;
  } | null;
  loading: boolean;
}

const PortfolioChartContainer: React.FC<Props> = ({
  labels,
  portfolio,
  raw,
  syncedScales,
  loading,
}) => {
  if (loading || !labels.length || !portfolio.length || !raw.length)
    return null;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolio,
        borderColor: "rgb(76, 148, 76)",
        pointRadius: 0,
        tension: 0.1,
        fill: false,
        yAxisID: "y1",
      },
      {
        label: "Growth of Initial Investment",
        data: raw,
        borderColor: "rgb(116, 116, 116)",
        pointRadius: 0,
        tension: 0.1,
        fill: false,
        yAxisID: "y2",
      },
    ],
  };

  return (
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
      <PortfolioChart chartData={chartData} syncedScales={syncedScales} />
    </div>
  );
};

export default PortfolioChartContainer;
