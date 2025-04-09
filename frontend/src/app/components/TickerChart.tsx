import React from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

interface TickerChartProps {
  chartData: ChartData<"line">;
}

const TickerChartComponent: React.FC<TickerChartProps> = ({ chartData }) => {
  if (!chartData) return null;

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => Number(value) - 100 + "%",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

const TickerChart = React.memo(TickerChartComponent);
TickerChart.displayName = "TickerChart";

export default TickerChart;
