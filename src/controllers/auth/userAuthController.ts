import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import UserAuthService from "../../services/auth/userAuthSerive";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validator/auth.validator";
import { HTTPSTATUS } from "../../config/http.config";
import UserAuthService from "../../services/auth/userAuthService";
import { responseFormatter } from "../../utils/helper";
import { UserRegisterDto } from "../../types/user.dto";
import path from "path";
import fs from "fs";
import { BadRequestException } from "../../utils/catch-errors";

class UserAuthController {
  private authService: UserAuthService;

  constructor(authService: UserAuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (
      req: Request<
        {},
        {},
        Omit<UserRegisterDto, "image" | "bg_image" | "nrc_front" | "nrc_back">
      >,
      res: Response,
      next: NextFunction
    ) => {
      // return res.status(HTTPSTATUS.OK).json({ message: "Hello" });

      const body = registerUserSchema.parse({
        ...req.body,
      });

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const nrcFrontFile = files?.["nrc_front"]
        ? files["nrc_front"][0]
        : undefined;

      if (!nrcFrontFile) {
        return res
          .status(400)
          .json(responseFormatter(false, "NRC Front or Passport is required"));
      }

      const registerData: UserRegisterDto = {
        ...body, // Ensure phone is correctly parsed by Zod
        image: files?.["image"] ? files["image"][0] : undefined,
        bg_image: files?.["bg_image"] ? files["bg_image"][0] : undefined,
        nrc_front: nrcFrontFile,
        nrc_back: files?.["nrc_back"] ? files["nrc_back"][0] : undefined,
      };

      const user = await this.authService.registerService(registerData);

      const response = responseFormatter(
        true,
        "User registered successfully",
        user
      );
      return res.status(HTTPSTATUS.CREATED).json(response);
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const body = loginUserSchema.parse({
        ...req.body,
      });

      const { user, accessToken, refreshToken } =
        await this.authService.loginService(body);

      return res.status(HTTPSTATUS.OK).json(
        responseFormatter(true, "Login successful", {
          user,
          accessToken,
          refreshToken,
        })
      );
    }
  );
}

const userAuthService = new UserAuthService();
const userAuthController = new UserAuthController(userAuthService);

export default userAuthController;
