import { z } from "zod";
import { ErrorRequestHandler, Response } from "express-serve-static-core";
import { HTTPSTATUS } from "../config/http.config";
import { AppError, responseFormatter } from "../utils/helper";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  const response = responseFormatter(false, "Validation failed", errors);
  return res.status(HTTPSTATUS.BAD_REQUEST).json(response);
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): any => {
  console.error(`Error occured on PATH: ${req.path}`, error);

  if (error instanceof SyntaxError) {
    const response = responseFormatter(
      false,
      "Invalid JSON format, please check your request body",
      error.message
    );
    return res.status(HTTPSTATUS.BAD_REQUEST).json(response);
  }

  if (error instanceof z.ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    const response = responseFormatter(false, error.message, error.errorCode);
    return res.status(error.statusCode).json(response);
  }

  const response = responseFormatter(false, "Internal Server Error");
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json(response);
};
