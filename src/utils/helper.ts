import { ResponseFormatter } from "../types/helper.dto";

export function responseFormatter<T>(
  success: boolean,
  message: string,
  data?: T[] | any
): ResponseFormatter<T> {
  return {
    success: success,
    message: message,
    data: data,
  };
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
