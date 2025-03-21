import type { IHealthStatus } from "@/constants";
import { checkDatabaseHealth } from "@lib/db";
import { checkEmailHealth } from "@lib/email";
import { checkRedisHealth } from "@lib/redis";

export default class HealthService {
  private healthReport: IHealthStatus[];

  constructor() {
    this.healthReport = [];
  }

  public async checkIntegrationsHealth(): Promise<IHealthStatus[]> {
    this.healthReport = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkEmailHealth(),
    ]);
    return this.healthReport;
  }

  public async checkDatabaseHealth(): Promise<IHealthStatus> {
    const connected = await checkDatabaseHealth();
    return { service: "DATABASE", connected };
  }

  public async checkEmailHealth(): Promise<IHealthStatus> {
    const connected = await checkEmailHealth();
    return { service: "RESEND", connected };
  }

  public async checkRedisHealth(): Promise<IHealthStatus> {
    const connected = await checkRedisHealth();
    return { service: "REDIS", connected };
  }
}
