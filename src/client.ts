import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;
type dataOutput = RouterOutput["calculateOption"];

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8080/trpc",
      // You can pass any HTTP headers you wish here
    }),
  ],
});

async function main() {
  const result = await client.calculateOption.mutate({
    symbol: "AAPL",
    startDate: "2024-06-30",
    endDate: "2024-09-19",
    optionPrice: 10,
    strikePrice: 181,
    expirationDate: "2024-09-19",
    optionType: "call",
    providedDelta: 0.5,
  });
  console.log(result);
}

main().catch(console.error);
