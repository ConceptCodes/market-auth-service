import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morganBody from "morgan-body";

import errorMiddleware from "@middleware/error";
import notFoundMiddleware from "@middleware/notFound";
import traceIdMiddleware from "@middleware/trace";
import type { Routes } from "@/constants";
import { env } from "@lib/env";
import { connectToRedis } from "@lib/redis";
import rateLimitMiddleware from "./middleware/rateLimit";

class App {
  public app: any;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = env.PORT;
    this.env = env.NODE_ENV || "production";

    this.initializeRedis();
    this.initializeMiddleware();
    this.initializeNotFoundHandling();
    this.initializeErrorHandling();
    this.initializeRoutes(routes);
  }

  public listen(): void {
    this.app.listen(this.port as number, () => {
      console.info("=====================================================");
      console.info(`================= ENV: ${this.env} ==================`);
      console.info(
        `===== Auth Service listening on PORT: ${this.port} ========`
      );
      console.info("=====================================================");
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private initializeMiddleware(): void {
    this.app.use(traceIdMiddleware);
    this.app.use(rateLimitMiddleware);
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    morganBody(this.app, {
      logRequestId: true,
      immediateReqLog: true,
      noColors: ["production", "development"].includes(env.NODE_ENV),
      logRequestBody: env.NODE_ENV === "local",
      logResponseBody: env.NODE_ENV === "local",
    });
  }

  private initializeRoutes(routes: Routes[]): void {
    routes.forEach((route) => {
      this.app.use("/api", route.router);
    });
  }

  private initializeRedis(): void {
    void connectToRedis();
  }

  private initializeNotFoundHandling(): void {
    this.app.use("*", notFoundMiddleware);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

export default App;
