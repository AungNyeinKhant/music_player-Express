import { NextFunction, Request, Response } from "express-serve-static-core";

type AsynControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (
  controller: AsynControllerType
): AsynControllerType => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
