// strategyService.js
export function analyzeStrategy({
  currentPrice,
  minPrice,
  buyInterval,
  sellInterval,
  marginPerLot,
  lotSize = 1,
  atr = 1000,
  averageTradingDaysPerMonth = 20,
  trendBias = 'neutral',
  useSip = true
}) {
  const levels = Math.floor((currentPrice - minPrice) / buyInterval);
  const totalPositions = levels + 1;
  const totalMargin = totalPositions * marginPerLot;

  const averageBuyPrice = (currentPrice + (currentPrice - levels * buyInterval)) / 2;
  const maxDrawdownPerLot = averageBuyPrice - minPrice;
  const totalMaxDrawdown = maxDrawdownPerLot * totalPositions * lotSize;

  const volatilityBuffer = atr * totalPositions;
  const totalCapitalNeeded = totalMargin + totalMaxDrawdown;
  const capitalWithBuffer = totalCapitalNeeded + volatilityBuffer;

  const profitPerLot = sellInterval;
  const totalProfitOnFullCycle = (totalPositions * (totalPositions - 1)) / 2 * profitPerLot * lotSize;
  const estimatedAnnualReturnLow = totalProfitOnFullCycle;
  const estimatedAnnualReturnHigh = totalProfitOnFullCycle * 3;

  const estimatedROI = {
    low: ((estimatedAnnualReturnLow / totalCapitalNeeded) * 100).toFixed(2) + '%',
    high: ((estimatedAnnualReturnHigh / totalCapitalNeeded) * 100).toFixed(2) + '%'
  };

  const breakevenPrice = currentPrice;
  const worstCaseLoss = totalMaxDrawdown;
  const taxAdjustedProfit = totalProfitOnFullCycle * 0.85;
  const netROI = ((taxAdjustedProfit / totalCapitalNeeded) * 100).toFixed(2) + '%';
  const winProb = 0.7;

  const payoffTable = [];
  const volatilityBufferSeries = [];

  for (let i = 0; i <= levels; i++) {
    const entryPrice = currentPrice - i * buyInterval;
    payoffTable.push({
      entryPrice,
      cost: marginPerLot,
      drawdown: entryPrice - minPrice,
      returnIfSoldAtTarget: (sellInterval * i) * lotSize
    });

    volatilityBufferSeries.push({
      position: i + 1,
      buffer: atr * (i + 1)
    });
  }

  const atrMovesPerMonth = (averageTradingDaysPerMonth * atr) / buyInterval;
  let trendMultiplier = 1;
  if (trendBias === 'bullish') trendMultiplier = 1.3;
  if (trendBias === 'bearish') trendMultiplier = 0.7;

  const positionsEnteredMonthly = Math.min(
    Math.floor(atrMovesPerMonth * trendMultiplier),
    totalPositions
  );
  const profitBookedMonthly = Math.floor(positionsEnteredMonthly / 2);
  const runningPositionsMonthly = positionsEnteredMonthly - profitBookedMonthly;
  const monthlyProfit = profitBookedMonthly * profitPerLot * lotSize;

  return {
    totalPositions,
    totalMargin,
    averageBuyPrice,
    maxDrawdownPerLot,
    totalMaxDrawdown,
    totalCapitalNeeded,
    capitalWithBuffer,
    volatilityBuffer,
    totalProfitOnFullCycle,
    estimatedAnnualReturnLow,
    estimatedAnnualReturnHigh,
    estimatedROI,
    breakevenPrice,
    worstCaseLoss,
    taxAdjustedProfit,
    netROI,
    winProb,
    payoffTable,
    volatilityBufferSeries,
    monthlyStats: {
      positionsEnteredMonthly,
      profitBookedMonthly,
      runningPositionsMonthly,
      monthlyProfit,
      averageTradingDaysPerMonth,
      trendBias
    }
  };
}
