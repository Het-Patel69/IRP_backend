import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.service";

const COOKIE_NAME = "accessToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await registerUser(req.body);

    res.cookie(
      COOKIE_NAME,
      result.token,
      cookieOptions,
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await loginUser(req.body);

    res.cookie(
      COOKIE_NAME,
      result.token,
      cookieOptions,
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = res.locals.userId as number;

    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function logout(
  req: Request,
  res: Response,
) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}