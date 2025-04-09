import React from "react";
import PortfolioChartContainer from "./PortfolioChartContainer";
import PerformanceMetrics from "./PerformanceMetrics";

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
  metrics: number[] | null;
}

const OutputSection: React.FC<Props> = ({
  labels,
  portfolio,
  raw,
  syncedScales,
  loading,
  metrics,
}) => {
  return (
    <div className="output_container">
      <PortfolioChartContainer
        labels={labels}
        portfolio={portfolio}
        raw={raw}
        syncedScales={syncedScales}
        loading={loading}
      />
      <PerformanceMetrics metrics={metrics} loading={loading} />
    </div>
  );
};

export default OutputSection;
