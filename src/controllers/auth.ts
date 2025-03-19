import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import AuthService from "@service/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "@/constants";

export default class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await this.service.login({
        email,
        password,
      });

      res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.header("Authorization", `Bearer ${accessToken}`);
      res.status(StatusCodes.OK).send({ message: "Login successful." });
    } catch (err) {
      next(err);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.register(req.body);
      res.status(StatusCodes.CREATED).json({
        message: "Verify your email address to complete registration.",
      });
    } catch (err) {
      next(err);
    }
  };
}
