import { Request, Response, NextFunction } from "express";
import { responseFormatter } from "../../utils/helper";
import packageService from "../../services/packageService";
import { asyncHandler } from "../../middleware/asyncHandler";

export const getPackages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const packages = await packageService.getPackages();
    const response = responseFormatter(
      true,
      "Packages retrieved successfully",
      packages
    );
    return res.status(200).json(response);
  }
);
