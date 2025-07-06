// strategyService.js
export function analyzeStrategy({
  currentPrice,
  minPrice,
  buyInterval,
  sellInterval,
  marginPerLot,
  lotSize = 1,
  monthlySipAmount,
  targetSellPrice,
  expectedReboundCyclesPerYear,
  reserveCapital,
  historicalWinRateGuess,
  taxRate
}) {
  const levels = Math.floor((currentPrice - minPrice) / buyInterval);
  const totalPositions = levels + 1;
  const totalMargin = totalPositions * marginPerLot;

  const averageBuyPrice = (currentPrice + (currentPrice - levels * buyInterval)) / 2;
  const maxDrawdownPerLot = averageBuyPrice - minPrice;
  const totalMaxDrawdown = maxDrawdownPerLot * totalPositions * lotSize;

  const totalCapitalNeeded = totalMargin + totalMaxDrawdown;

  const profitPerLot = sellInterval;
  const totalProfitOnFullCycle = (totalPositions * (totalPositions - 1)) / 2 * profitPerLot * lotSize;

  const estimatedAnnualReturnLow = totalProfitOnFullCycle * expectedReboundCyclesPerYear * 0.5;
  const estimatedAnnualReturnHigh = totalProfitOnFullCycle * expectedReboundCyclesPerYear;

  const estimatedROI = {
    low: ((estimatedAnnualReturnLow / totalCapitalNeeded) * 100).toFixed(2) + '%',
    high: ((estimatedAnnualReturnHigh / totalCapitalNeeded) * 100).toFixed(2) + '%'
  };

  const breakevenPrice = averageBuyPrice + (totalProfitOnFullCycle / (totalPositions * lotSize));
  const worstCaseLoss = totalMaxDrawdown;

  const payoffTable = Array.from({ length: totalPositions }, (_, i) => {
    const price = currentPrice - i * buyInterval;
    const cost = marginPerLot;
    const drawdown = averageBuyPrice - price;
    const returnIfSoldAtTarget = (targetSellPrice - price) * lotSize;
    return {
      level: i + 1,
      entryPrice: price,
      cost,
      drawdown,
      returnIfSoldAtTarget
    };
  });

  const taxAdjustedProfit = totalProfitOnFullCycle * (1 - taxRate / 100);
  const netROI = ((taxAdjustedProfit / totalCapitalNeeded) * 100).toFixed(2) + '%';

  const capitalWithBuffer = totalCapitalNeeded + reserveCapital;
  const winProb = (historicalWinRateGuess / 100).toFixed(2);

  return {
    totalPositions,
    totalMargin,
    averageBuyPrice,
    maxDrawdownPerLot,
    totalMaxDrawdown,
    totalCapitalNeeded,
    totalProfitOnFullCycle,
    estimatedAnnualReturnLow,
    estimatedAnnualReturnHigh,
    estimatedROI,
    breakevenPrice,
    worstCaseLoss,
    payoffTable,
    taxAdjustedProfit,
    netROI,
    capitalWithBuffer,
    winProb
  };
}
