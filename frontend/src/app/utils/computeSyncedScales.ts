export function computeSyncedScales(
  portfolioVals: number[],
  rawVals: number[]
): {
  y1Min: number;
  y1Max: number;
  y2Min: number;
  y2Max: number;
} | null {
  if (!portfolioVals.length || !rawVals.length) return null;

  if (portfolioVals[0] === 0 || rawVals[0] === 0) {
    const y1Min = Math.min(...portfolioVals);
    const y1Max = Math.max(...portfolioVals);
    const y2Min = Math.min(...rawVals);
    const y2Max = Math.max(...rawVals);

    const y1oom = Math.log10(Math.max(1, y1Max));
    const y1round = Math.pow(10, Math.max(0, Math.ceil(y1oom - 1)));
    const y2oom = Math.log10(Math.max(1, y2Max));
    const y2round = Math.pow(10, Math.max(0, Math.ceil(y2oom - 1)));

    return {
      y1Min: Math.floor(y1Min / y1round) * y1round,
      y1Max: Math.ceil(y1Max / y1round) * y1round,
      y2Min: Math.floor(y2Min / y2round) * y2round,
      y2Max: Math.ceil(y2Max / y2round) * y2round,
    };
  }

  const round_val = Math.pow(
    10,
    Math.ceil(Math.log10(Math.max(...portfolioVals)) - 1)
  );

  const y1RatioMin = Math.min(...portfolioVals) / portfolioVals[0];
  const y1RatioMax = Math.max(...portfolioVals) / portfolioVals[0];

  const y2RatioMin = Math.min(...rawVals) / rawVals[0];
  const y2RatioMax = Math.max(...rawVals) / rawVals[0];

  const y1RawMin = Math.min(y1RatioMin, y2RatioMin) * portfolioVals[0];
  const y1RawMax = Math.max(y1RatioMax, y2RatioMax) * portfolioVals[0];

  const y1Max = Math.ceil(y1RawMax / round_val) * round_val;
  const y1Min = Math.floor(y1RawMin / round_val) * round_val;

  const y2Min = Math.round((y1Min / portfolioVals[0]) * rawVals[0]);
  const y2Max = Math.round((y1Max / portfolioVals[0]) * rawVals[0]);

  return { y1Min, y1Max, y2Min, y2Max };
}
