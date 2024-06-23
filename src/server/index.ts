import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./router";
import cors from "cors"; // Correct import

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});

const port = 8080;
const app = express();

const allowedOrigins = [`http://localhost:${port}`];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(options));
app.use(express.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(port, () => {
  console.log(`tRPC server is running on http://localhost:${port}/trpc`);
});
