// components/PortfolioForm.tsx
import React from "react";

interface PortfolioFormProps {
  startDate: string;
  endDate: string;
  initial: string;
  addition: string;
  frequency: string;
  weightError: string;
  loadingPortfolio: boolean;
  loadingTickers: boolean;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setInitial: (value: string) => void;
  setAddition: (value: string) => void;
  setFrequency: (value: string) => void;
  onSubmit: () => void;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({
  startDate,
  endDate,
  initial,
  addition,
  frequency,
  weightError,
  loadingPortfolio,
  loadingTickers,
  setStartDate,
  setEndDate,
  setInitial,
  setAddition,
  setFrequency,
  onSubmit,
}) => {
  return (
    <div className="portfolio-form">
      <h2 className="sub-title">Portfolio Options</h2>
      <div className="input-row">
        {/* Start Date */}
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            min="1970-01-01"
            max="2024-12-31"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            min="1970-01-01"
            max="2024-12-31"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Initial Investment */}
        <div className="form-group">
          <label>Initial Investment ($)</label>
          <input
            type="number"
            min={0}
            max={10000000}
            value={initial}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setInitial("");
              } else {
                let num = parseFloat(val);
                if (!isNaN(num)) {
                  num = Math.max(0, Math.min(10000000, num));
                  setInitial(num.toString());
                } else {
                  setInitial("");
                }
              }
            }}
            placeholder="(e.g. 1000)"
          />
        </div>

        {/* Recurring Amount */}
        <div className="form-group">
          <label>Recurring Amount ($)</label>
          <input
            type="number"
            min={0}
            max={10000000}
            value={addition}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setAddition("");
              } else {
                let num = parseFloat(val);
                if (!isNaN(num)) {
                  num = Math.max(0, Math.min(10000000, num));
                  setAddition(num.toString());
                } else {
                  setAddition("");
                }
              }
            }}
            placeholder="(e.g. 100)"
          />
        </div>

        {/* Frequency */}
        <div className="form-group">
          <label>Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <button
        onClick={onSubmit}
        className="submit-btn"
        disabled={loadingPortfolio || loadingTickers}
      >
        {loadingPortfolio
          ? "Loading Portfolio..."
          : loadingTickers
          ? "Loading Tickers..."
          : "Submit"}
      </button>

      {weightError && (
        <p style={{ color: "red", marginTop: "1rem", fontSize: "0.875rem" }}>
          {weightError}
        </p>
      )}
    </div>
  );
};

export default PortfolioForm;
