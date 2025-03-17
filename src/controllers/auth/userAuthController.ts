import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import UserAuthService from "../../services/auth/userAuthSerive";
import {
  loginArtistSchema,
  registerArtistSchema,
} from "../../validator/auth.validator";
import { HTTPSTATUS } from "../../config/http.config";

export default class UserAuthController {
  private authService: UserAuthService;

  constructor(authService: UserAuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const body = registerArtistSchema.parse({
        ...req.body,
      });
      const { user } = await this.authService.registerUser(body);
      return res.status(HTTPSTATUS.CREATED).json({
        message: "User registered successfully",
        data: user,
      });
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const body = loginArtistSchema.parse({
        ...req.body,
      });
    }
  );
}
