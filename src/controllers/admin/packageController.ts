import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { responseFormatter } from "../../utils/helper";
import {
  confirmPurchaseSchema,
  createPackageSchema,
} from "../../validator/package.validator";
import packageService from "../../services/packageService";
import { z } from "zod";

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

export const confirmPurchase = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { purchase_id } = confirmPurchaseSchema.parse(req.body);

    const confirmedPurchase = await packageService.confirmPurchase(purchase_id);

    return res
      .status(200)
      .json(
        responseFormatter(
          true,
          "Purchase confirmed successfully",
          confirmedPurchase
        )
      );
  }
);
