import cors from "cors";
import { env } from "@lib/env";
import { createLogger } from "@lib/logger";

const logger = createLogger("cors-middleware");

const corsMiddleware = () => {
  const apiGatewayUrl = env.API_GATEWAY_URL || "http://api-gateway:8080";

  const allowedOrigins = [apiGatewayUrl];

  if (env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:8080");
  }

  logger.info(
    { allowedOrigins },
    "Configuring CORS for internal service communication"
  );

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like internal service-to-service calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "Blocked request from unauthorized origin");
        callback(new Error("Not allowed by CORS - internal service only"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Trace-Id",
      "X-API-Key",
      "X-Service-Name",
    ],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    credentials: true,
    maxAge: 86400, // Cache preflight results for 24 hours
  });
};

export default corsMiddleware;
