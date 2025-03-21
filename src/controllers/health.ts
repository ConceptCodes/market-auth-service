import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import HealthService from "@service/health";

class HealthController {
  private healthService = new HealthService();

  public getLiveness = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.status(StatusCodes.OK).json({ message: "PONG" });
    } catch (err) {
      next(err);
    }
  };

  public getHealthiness = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const status = await this.healthService.checkIntegrationsHealth();
      res.status(StatusCodes.OK).json(status);
    } catch (err) {
      next(err);
    }
  };
}

export default HealthController;
