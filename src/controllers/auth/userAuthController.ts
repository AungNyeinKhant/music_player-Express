import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validator/auth.validator";
import { HTTPSTATUS } from "../../config/http.config";

import { responseFormatter } from "../../utils/helper";
import { UserRegisterDto } from "../../types/user.dto";
import UserAuthService from "../../services/auth/userAuthService";

class UserAuthController {
  private authService: UserAuthService;

  constructor(authService: UserAuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (
      req: Request<{}, {}, Omit<UserRegisterDto, "image">>,
      res: Response,
      next: NextFunction
    ) => {
      const body = registerUserSchema.parse({
        ...req.body,
      });

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const imageFile = files?.["image"] ? files["image"][0] : undefined;

      const registerData: UserRegisterDto = {
        ...body, // Ensure phone is correctly parsed by Zod
        image: imageFile,
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
