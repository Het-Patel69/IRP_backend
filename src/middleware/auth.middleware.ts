import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import { AppError } from "../errors/AppError";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError(
        "JWT secret is not configured",
        500,
        "JWT_SECRET_MISSING",
      );
    }

    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      !payload.sub
    ) {
      throw new AppError(
        "Invalid authentication token",
        401,
        "INVALID_TOKEN",
      );
    }

    const userId = Number(payload.sub);

    if (Number.isNaN(userId)) {
      throw new AppError(
        "Invalid authentication token",
        401,
        "INVALID_TOKEN",
      );
    }

    res.locals.userId = userId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError(
          "Session expired",
          401,
          "TOKEN_EXPIRED",
        ),
      );
    }

    return next(
      new AppError(
        "Invalid authentication token",
        401,
        "INVALID_TOKEN",
      ),
    );
  }
}