import yahooFinance from "yahoo-finance2";

interface HistoricalPrice {
  date: string;
  close: number;
}

class GetPrice {
  private symbol: string;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  public async getCurrentPrice(): Promise<number> {
    try {
      const quote = await yahooFinance.quote(this.symbol);
      if (!quote.regularMarketPrice) {
        throw new Error("No price found");
      }
      return quote.regularMarketPrice;
    } catch (error) {
      console.error(`Failed to fetch current price: ${error}`);
      throw error;
    }
  }

  public async getHistoricalPrices(
    startDate: string,
    endDate: string,
  ): Promise<HistoricalPrice[]> {
    try {
      const historical = await yahooFinance.historical(this.symbol, {
        period1: startDate,
        period2: endDate,
      });
      return historical.map((data: any) => ({
        date: data.date.toISOString().split("T")[0],
        close: data.close,
      }));
    } catch (error) {
      console.error(`Failed to fetch historical prices: ${error}`);
      throw error;
    }
  }
}

export { GetPrice, HistoricalPrice };
