import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};