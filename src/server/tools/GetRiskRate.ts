import yahooFinance from "yahoo-finance2";

class FetchRiskFreeRate {
  public static async getRiskFreeRate(): Promise<number> {
    try {
      const result = await yahooFinance.quote("^TNX"); // ^TNX is the ticker symbol for the 10-year U.S. Treasury yield
      if (!result.regularMarketPrice) {
        throw new Error("No price found");
      }
      return result.regularMarketPrice / 100; // Convert percentage to decimal
    } catch (error) {
      console.error(`Failed to fetch risk-free rate: ${error}`);
      throw error;
    }
  }
}

export default FetchRiskFreeRate;
