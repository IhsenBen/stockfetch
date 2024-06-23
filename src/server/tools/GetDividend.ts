import yahooFinance from "yahoo-finance2";

class DividendFetcher {
  /**
   * Fetches the dividend yield for a given stock symbol
   * @param symbol The stock symbol
   * @returns The dividend yield as a decimal (e.g., 0.02 for 2%)
   */
  public static async getDividendYield(symbol: string): Promise<number> {
    try {
      const quoteSummary = await yahooFinance.quoteSummary(symbol, {
        modules: ["summaryDetail"],
      });
      const dividendYield = quoteSummary.summaryDetail?.dividendYield;

      if (dividendYield !== undefined && dividendYield !== null) {
        return dividendYield;
      } else {
        console.warn(`No dividend yield found for ${symbol}`);
        return 0;
      }
    } catch (error) {
      console.error(`Failed to fetch dividend yield for ${symbol}: ${error}`);
      throw error;
    }
  }
}

export default DividendFetcher;
