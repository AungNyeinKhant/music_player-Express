import { z } from "zod";
import {
  ErrorRequestHandler,
  Request,
  Response,
} from "express-serve-static-core";
import { HTTPSTATUS } from "../config/http.config";
import { AppError, responseFormatter } from "../utils/helper";
import path from "path";
import fs from "fs";
import { BadRequestException } from "../utils/catch-errors";
import { deleteUploadedFile } from "./multer";

const formatZodError = (res: Response, error: z.ZodError, req: Request) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  if (req.files) {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    console.log("Schema Error Files", files);
    // Loop through each uploaded file field and delete them
    Object.values(files).forEach((fileArray) => {
      fileArray.forEach((file) => {
        const filePath = path.join(__dirname, "..", file.path);
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting file ${file.filename}:`, err);
        });
      });
    });
    console.log("Files found and deleted");
  } else {
    console.log("No files found in request");
  }

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
  deleteUploadedFile(req);

  if (error instanceof SyntaxError) {
    const response = responseFormatter(
      false,
      "Invalid JSON format, please check your request body",
      error.message
    );

    return res.status(HTTPSTATUS.BAD_REQUEST).json(response);
  }

  if (error instanceof z.ZodError) {
    return formatZodError(res, error, req);
  }

  if (error instanceof AppError) {
    const response = responseFormatter(false, error.message, error.errorCode);
    return res.status(error.statusCode).json(response);
  }

  if (error instanceof BadRequestException) {
    return res.status(400).json({
      message: error.message,
      ororCode: error.errorCode,
    });
  }

  const response = responseFormatter(false, "Internal Server Error");
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json(response);
};
