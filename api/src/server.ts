import compression from "compression";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./configs/cors";
import { closeDb } from "./configs/db";
import { env } from "./configs/env";
import { apiLimiter } from "./configs/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import routes from "./routes/routes";
import { logger } from "./utils/logger";

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// testing route
app.use("/", routes);

// API routes
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`The server is running on http://localhost:${env.PORT}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    closeDb()
      .catch((error) => logger.error("Error closing database pool", error))
      .finally(() => process.exit(0));
  });
}
