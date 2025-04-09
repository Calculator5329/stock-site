// hooks/usePortfolioData.ts
import { useEffect } from "react";

interface PortfolioEntry {
  ticker: string;
  weight: number;
}

interface PortfolioData {
  dates: string[];
  portfolio: number[];
  raw: number[];
  data: number[];
}

export const usePortfolioData = (
  portfolio: PortfolioEntry[],
  startDate: string,
  endDate: string,
  initial: string,
  addition: string,
  frequency: string,
  onError: (message: string) => void,
  onSuccess: (data: PortfolioData) => void,
  setLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      const totalWeight = portfolio.reduce(
        (sum, entry) => sum + (Number(entry.weight) || 0),
        0
      );
      if (Math.round(totalWeight) !== 100) {
        onError("Ticker weights must add up to 100%. Please try again.");
        setLoading(false);
        return;
      }

      const portfolioDict: Record<string, number> = {};
      portfolio.forEach(({ ticker, weight }) => {
        if (ticker && Number(weight) >= 0) {
          portfolioDict[ticker] = Number(weight) / 100;
        }
      });

      try {
        const res = await fetch(
          "https://portfoliobackend5329.azurewebsites.net/portfolio",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              portfolio: portfolioDict,
              start_date: startDate,
              end_date: endDate,
              initial: Number(initial) || 0,
              addition: Number(addition) || 0,
              frequency,
            }),
          }
        );

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const json = await res.json();
        if (!json?.dates || !json?.portfolio || !json?.raw || !json?.data) {
          throw new Error("Invalid portfolio data structure");
        }

        onSuccess(json);
      } catch (err: unknown) {
        console.error("Portfolio fetch error:", err);
        if (err instanceof Error) {
          onError(err.message);
        } else {
          onError(String(err));
        }
      }
    };

    fetchPortfolioData();
  }, [
    portfolio,
    startDate,
    endDate,
    initial,
    addition,
    frequency,
    onError,
    onSuccess,
    setLoading,
  ]);
};
