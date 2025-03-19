import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";

import {
  loginAdminSchema,
  registerAdminSchema,
} from "../../validator/auth.validator";
import { HTTPSTATUS } from "../../config/http.config";
import AdminAuthService from "../../services/auth/adminAuthService";
import { responseFormatter } from "../../utils/helper";

import path from "path";
import fs from "fs";
import { BadRequestException } from "../../utils/catch-errors";
import { AdminRegisterDto } from "../../types/admin.dto";

class AdminAuthController {
  private authService: AdminAuthService;

  constructor(authService: AdminAuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (
      req: Request<{}, {}, Omit<AdminRegisterDto, "image">>,
      res: Response,
      next: NextFunction
    ) => {
      // return res.status(HTTPSTATUS.OK).json({ message: "Hello" });

      const body = registerAdminSchema.parse({
        ...req.body,
      });

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const registerData: AdminRegisterDto = {
        ...body, // Ensure phone is correctly parsed by Zod
        image: files?.["image"] ? files["image"][0] : undefined,
      };

      const admin = await this.authService.registerService(registerData);

      const response = responseFormatter(
        true,
        "Admin registered successfully",
        admin
      );
      return res.status(HTTPSTATUS.CREATED).json(response);
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const body = loginAdminSchema.parse({
        ...req.body,
      });

      const { admin, accessToken, refreshToken } =
        await this.authService.loginService(body);

      return res.status(HTTPSTATUS.OK).json(
        responseFormatter(true, "Login successful", {
          admin,
          accessToken,
          refreshToken,
        })
      );
    }
  );
}

const adminAuthService = new AdminAuthService();
const adminAuthController = new AdminAuthController(adminAuthService);

export default adminAuthController;
