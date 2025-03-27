import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { responseFormatter } from "../../utils/helper";
import { createPackageSchema } from "../../validator/package.validator";
import packageService from "../../services/packageService";

export const createPackage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const body = createPackageSchema.parse({
      ...req.body,
    });

    const newPackage = await packageService.createPackage(body);

    return res
      .status(201)
      .json(
        responseFormatter(true, "Package created successfully", newPackage)
      );
  }
);
