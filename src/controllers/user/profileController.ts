import { Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import userService from "../../services/userService";
import { responseFormatter } from "../../utils/helper";
import { getTokenData } from "../../utils/jwt";
import { UserRegisterDto } from "../../types/user.dto";

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getTokenData(req, res);
    const user = await userService.findUser(userId);
    res.status(200).json(
      responseFormatter(true, "User profile retrieved successfully", user)
    );
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request<{}, {}, Partial<UserRegisterDto>>, res: Response) => {
    const { userId } = getTokenData(req, res);
    
    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    const updateData = {
      ...req.body,
      image: files?.["image"]?.[0],
    };

    const updatedUser = await userService.updateUser(userId, updateData);
    res.status(200).json(
      responseFormatter(true, "User profile updated successfully", updatedUser)
    );
  }
);
