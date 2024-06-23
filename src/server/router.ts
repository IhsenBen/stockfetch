import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { GetPrice } from "./tools/GetPrice";
import VolatilityCalculator from "./tools/GetVolatility";
import FetchRiskFreeRate from "./tools/GetRiskRate";
import DividendFetcher from "./tools/GetDividend";
import BlackScholesModel from "./tools/BlackSholesModel";
import fs from "fs";

const t = initTRPC.create();

export const appRouter = t.router({
  calculateOption: t.procedure
    .input(
      z.object({
        symbol: z.string(),
        startDate: z.string(),
        optionPrice: z.number(),
        endDate: z.string(),
        strikePrice: z.number(),
        expirationDate: z.string(),
        optionType: z.enum(["call", "put"]),
        providedDelta: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const {
        symbol,
        startDate,
        endDate,
        strikePrice,
        expirationDate,
        optionType,
        optionPrice,
        providedDelta,
      } = input;

      const priceFetcher = new GetPrice(symbol);

      const currentPrice = await priceFetcher.getCurrentPrice();
      console.log(`Current price of ${symbol}: $${currentPrice}`);

      const historicalPrices = await priceFetcher.getHistoricalPrices(
        startDate,
        endDate,
      );
      const volatility =
        VolatilityCalculator.calculateVolatility(historicalPrices);
      console.log(`Calculated volatility of ${symbol}: ${volatility}`);

      // Calculate time to expiration in years
      const currentDate = new Date();
      const expDate = new Date(expirationDate);
      const timeToExpiration =
        (expDate.getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365);

      // Fetch risk-free interest rate
      const riskFreeRate = await FetchRiskFreeRate.getRiskFreeRate();
      console.log(`Risk-free interest rate: ${riskFreeRate}`);

      // Fetch dividend yield
      const dividendYield = await DividendFetcher.getDividendYield(symbol);
      console.log(`Dividend yield for ${symbol}: ${dividendYield}`);

      // Calculate option price based on the option type
      const serverSholesPrice = BlackScholesModel.calculatePrice(
        currentPrice,
        strikePrice,
        timeToExpiration,
        riskFreeRate,
        dividendYield,
        volatility,
        optionType,
      );
      console.log(`Server calculated price: ${serverSholesPrice}`);

      // Calculate server delta
      const serverDelta = BlackScholesModel.calculateDelta(
        currentPrice,
        strikePrice,
        timeToExpiration,
        riskFreeRate,
        dividendYield,
        volatility,
        optionType,
      );
      console.log(`Server calculated delta: ${serverDelta}`);

      const result = {
        currentPrice,
        optionType,
        volatility,
        riskFreeRate,
        dividendYield,
        optionPrice,
        serverSholesPrice,
        serverDelta,
        providedDelta,
        deltaDifference: providedDelta
          ? Math.abs(serverDelta - providedDelta)
          : null,
      };

      fs.writeFileSync("data.json", JSON.stringify(result));
      console.log("Data written to file");

      return result;
    }),
});

export type AppRouter = typeof appRouter;
