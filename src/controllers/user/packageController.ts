import { Request, Response, NextFunction } from "express";
import { responseFormatter } from "../../utils/helper";
import packageService from "../../services/packageService";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getTokenData } from "../../utils/jwt";

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

export const subscribePackage = asyncHandler(
  async (
    req: Request<{}, {}, Omit<{ package_id: string }, "transition">>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { package_id } = req.body;
    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;
    if (!package_id) {
      res.status(400).json({
        message: "package_id is required",
      });
    }

    const transitionSs = files?.["transition"]
      ? files["transition"][0]
      : undefined;

    if (!transitionSs) {
      return res
        .status(400)
        .json(
          responseFormatter(false, "Payment transition screenshot is required")
        );
    }

    const payload = getTokenData(req, res);
    const user_id = payload.userId;

    const purchase = await packageService.subscribePackage(
      user_id,
      package_id,
      transitionSs
    );
    const response = responseFormatter(
      true,
      "Package subscription created successfully",
      purchase
    );
    return res.status(201).json(response);
  }
);
