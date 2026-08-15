import cors from "cors";
import { env } from "./env";

const origins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

export const corsMiddleware = cors({
  origin: origins.includes("*") ? true : origins,
  credentials: true,
});
