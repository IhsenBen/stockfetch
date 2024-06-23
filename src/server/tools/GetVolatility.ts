import { HistoricalPrice } from "./GetPrice";

class VolatilityCalculator {
  public static calculateVolatility(
    historicalPrices: HistoricalPrice[],
  ): number {
    const returns = historicalPrices
      .map((price, index, arr) => {
        if (index === 0) return 0;
        return Math.log(price.close / arr[index - 1].close);
      })
      .filter((returnVal) => returnVal !== 0);

    const meanReturn =
      returns.reduce((sum, returnVal) => sum + returnVal, 0) / returns.length;
    const squaredDiffs = returns.map((returnVal) =>
      Math.pow(returnVal - meanReturn, 2),
    );
    const variance =
      squaredDiffs.reduce((sum, diff) => sum + diff, 0) /
      (squaredDiffs.length - 1);

    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility?
  }
}

export default VolatilityCalculator;
