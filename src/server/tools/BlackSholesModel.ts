import cdf from "@stdlib/stats-base-dists-normal-cdf";
//[]TODO test this with trade republic european warants
//if thhe provided delta is close to the server calculated deltan then the Model might be correct
// unit test with known  past values?
// goal is to use this for a little ui form that gives some tools for :
//1- Volatility Arbitrage:
// Statistical Arbitrage: This strategy involves trading options based on the perceived mispricing from the Black-Scholes model due to volatility differences. Traders might buy underpriced options and sell overpriced options.
// Delta Hedging: Involves creating a delta-neutral portfolio by balancing the options with underlying assets to hedge against price movements, capitalizing on volatility discrepancies.
// 2-Convertible Arbitrage:
//
// Involves buying convertible securities and hedging by shorting the underlying stock, taking advantage of mispriced options implied by convertible securities.
// 3-Risk Arbitrage:
// Often used in merger and acquisition scenarios where options are priced differently based on anticipated future volatility.
//[]TODO throw error if expiration date is not in future, (can return null values)
class BlackScholesModel {
  // Implementing the error function
  private static erf(x: number): number {
    // Constants for the approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    // Save the sign of x
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Calculate d1 in the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @returns The d1 value
   */
  private static d1(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
  ): number {
    console.log(
      `Inputs for d1 calculation: S=${S}, K=${K}, T=${T}, r=${r}, q=${q}, σ=${σ}`,
    );
    const d1 =
      (Math.log(S / K) + (r - q + 0.5 * σ * σ) * T) / (σ * Math.sqrt(T));
    console.log(`d1: ${d1}`);
    return d1;
  }

  /**
   * Calculate d2 in the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @returns The d2 value
   */
  private static d2(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
  ): number {
    const d2 = this.d1(S, K, T, r, q, σ) - σ * Math.sqrt(T);
    console.log(`d2: ${d2}`);
    return d2;
  }

  /**
   * Cumulative distribution function for the standard normal distribution
   * @param x The input value
   * @returns The cumulative probability for a standard normal distribution
   */
  private static cdf(x: number): number {
    const result = cdf(x, 0, 1);
    console.log(`CDF(${x}): ${result}`);
    return result;
  }

  /**
   * Calculate the price of a call option using the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @returns The price of the call option
   */
  public static calculateCallPrice(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
  ): number {
    const d1 = this.d1(S, K, T, r, q, σ);
    const d2 = this.d2(S, K, T, r, q, σ);
    return (
      S * Math.exp(-q * T) * this.cdf(d1) - K * Math.exp(-r * T) * this.cdf(d2)
    );
  }

  /**
   * Calculate the price of a put option using the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @returns The price of the put option
   */
  public static calculatePutPrice(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
  ): number {
    const d1 = this.d1(S, K, T, r, q, σ);
    const d2 = this.d2(S, K, T, r, q, σ);
    return (
      K * Math.exp(-r * T) * this.cdf(-d2) -
      S * Math.exp(-q * T) * this.cdf(-d1)
    );
  }

  /**
   * Calculate the prices of both call and put options using the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @returns An object containing the prices of the call and put options
   */
  public static calculate(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
  ): { callPrice: number; putPrice: number } {
    const callPrice = this.calculateCallPrice(S, K, T, r, q, σ);
    const putPrice = this.calculatePutPrice(S, K, T, r, q, σ);
    return { callPrice, putPrice };
  }

  /**
   * Calculate the price of either a call or a put option using the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @param optionType The type of option ("call" or "put")
   * @returns The price of the specified option
   */
  public static calculatePrice(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
    optionType: "call" | "put",
  ): number {
    const d1 = this.d1(S, K, T, r, q, σ);
    const d2 = this.d2(S, K, T, r, q, σ);

    if (optionType === "call") {
      return (
        S * Math.exp(-q * T) * this.cdf(d1) -
        K * Math.exp(-r * T) * this.cdf(d2)
      );
    } else {
      return (
        K * Math.exp(-r * T) * this.cdf(-d2) -
        S * Math.exp(-q * T) * this.cdf(-d1)
      );
    }
  }

  /**
   * Calculate the delta of a call or put option using the Black-Scholes formula
   * @param S Current stock price
   * @param K Strike price
   * @param T Time to expiration in years
   * @param r Risk-free interest rate
   * @param q Dividend yield
   * @param σ Volatility of the stock
   * @param optionType The type of option ("call" or "put")
   * @returns The delta of the specified option
   */
  public static calculateDelta(
    S: number,
    K: number,
    T: number,
    r: number,
    q: number,
    σ: number,
    optionType: "call" | "put",
  ): number {
    const d1 = this.d1(S, K, T, r, q, σ);
    if (optionType === "call") {
      return this.cdf(d1);
    } else {
      return this.cdf(d1) - 1;
    }
  }
}

export default BlackScholesModel;
