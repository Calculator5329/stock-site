// components/PortfolioChart.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
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

// Ensure these are registered before any chart is rendered
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  yAxisID?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface SyncedScales {
  y1Min: number;
  y1Max: number;
  y2Min: number;
  y2Max: number;
}

interface PortfolioChartProps {
  chartData: ChartData;
  syncedScales: SyncedScales | null;
}

// Component definition
const PortfolioChartComponent: React.FC<PortfolioChartProps> = ({
  chartData,
  syncedScales,
}) => {
  if (!chartData) return null;

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        min: syncedScales?.y1Min,
        max: syncedScales?.y1Max,
        ticks: {
          callback: (value: string | number) => "$" + value,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y2: {
        type: "linear",
        position: "right",
        min: syncedScales?.y2Min,
        max: syncedScales?.y2Max,
        ticks: {
          callback: (value: string | number) => Number(value) - 100 + "%",
        },
        grid: {
          drawOnChartArea: false,
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

// Memoize and set displayName
const PortfolioChart = React.memo(PortfolioChartComponent);
PortfolioChart.displayName = "PortfolioChart";

export default PortfolioChart;
