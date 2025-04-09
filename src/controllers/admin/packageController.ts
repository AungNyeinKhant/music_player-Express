import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { responseFormatter } from "../../utils/helper";
import {
  confirmPurchaseSchema,
  createPackageSchema,
} from "../../validator/package.validator";
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

export const confirmPurchase = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { purchase_id, reject } = confirmPurchaseSchema.parse(req.body);

    const confirmedPurchase = await packageService.confirmPurchase(
      purchase_id,
      reject
    );

    const message = reject
      ? "Purchase rejected successfully"
      : "Purchase confirmed successfully";

    return res
      .status(200)
      .json(responseFormatter(true, message, confirmedPurchase));
  }
);

export const purchaseList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const purchases = await packageService.getPurchaseList();

    return res
      .status(200)
      .json(
        responseFormatter(true, "Purchases retrieved successfully", purchases)
      );
  }
);

export const updatePackage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const body = createPackageSchema.parse({
      ...req.body,
    });

    const updatedPackage = await packageService.updatePackage(id, body);

    return res
      .status(200)
      .json(responseFormatter(true, "Package updated successfully", updatedPackage));
  }
);

export const deletePackage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;

    const deletedPackage = await packageService.deletePackage(id);

    return res
      .status(200)
      .json(responseFormatter(true, "Package deleted successfully", deletedPackage));
  }
);
