import { ResponseFormatter } from "../types/helper.dto";
import { HTTPSTATUS, HttpStatusCode } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import bcrypt from "bcrypt";

export function responseFormatter<T>(
  success: boolean,
  message: string,
  data?: T[] | any
): ResponseFormatter<T> {
  if (success) {
    return {
      success: success,
      message: message,
      data: data,
    };
  } else {
    return {
      success: success,
      message: message,
      error: data,
    };
  }
}

export const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Enviroment variable ${key} is not set`);
  }
  return value;
};

export class AppError extends Error {
  public statusCode: HttpStatusCode;
  public errorCode?: ErrorCode;

  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCode
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const hashValue = async (value: string, saltRounds: number = 10) =>
  await bcrypt.hash(value, saltRounds);

export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue);
