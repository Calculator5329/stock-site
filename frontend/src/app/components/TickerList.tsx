// components/TickerList.tsx
import React, { RefObject } from "react";

interface TickerEntry {
  ticker: string;
  weight: number;
}

interface TickerListProps {
  portfolio: TickerEntry[];
  defaultTickers: string[];
  tickerContainerRef: RefObject<HTMLDivElement | null>;
  updateTicker: (index: number, key: string, value: string | number) => void;
  addTicker: () => void;
  removeTicker: (index: number) => void;
  weightError: string;
}

const TickerList: React.FC<TickerListProps> = ({
  portfolio,
  defaultTickers,
  tickerContainerRef,
  updateTicker,
  addTicker,
  removeTicker,
  weightError,
}) => {
  return (
    <div className="ticker-selection" ref={tickerContainerRef}>
      <h2 className="sub-title">Portfolio</h2>
      {portfolio.map((entry, i) => (
        <div
          key={i}
          className="form-group"
          style={{
            display: "flex",
            gap: "1.5rem",
            marginBottom: "0.5rem",
            borderRadius: "10px",
            padding: "1rem",
          }}
        >
          <input
            list="ticker-options"
            value={entry.ticker}
            onChange={(e) =>
              updateTicker(i, "ticker", e.target.value.toUpperCase())
            }
            className="input-field"
            placeholder="Search ticker..."
          />
          <datalist id="ticker-options">
            {defaultTickers.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>

          <div style={{ position: "relative", margin: 0, padding: 0 }}>
            <input
              type="number"
              min={0}
              max={100}
              value={entry.weight}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateTicker(
                  i,
                  "weight",
                  isNaN(value) ? 0 : Math.max(0, Math.min(100, value))
                );
              }}
              className="input-field"
              style={{ paddingRight: "2rem", margin: 0 }}
              placeholder="%"
            />
            <span
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#999",
              }}
            >
              %
            </span>
          </div>

          {portfolio.length > 1 && (
            <button
              onClick={() => removeTicker(i)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                margin: 0,
                fontSize: "1.5rem",
                pointerEvents: "auto",
              }}
              aria-label="Remove ticker"
            >
              🗑️
            </button>
          )}
        </div>
      ))}

      {weightError && (
        <p style={{ color: "red", margin: 0, fontSize: "0.875rem" }}>
          {weightError}
        </p>
      )}

      <button onClick={addTicker} className="submit-btn">
        Add Ticker
      </button>
    </div>
  );
};

export default TickerList;
