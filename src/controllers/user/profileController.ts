import { Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import userService from "../../services/userService";
import { responseFormatter } from "../../utils/helper";
import { getTokenData } from "../../utils/jwt";
import { UserRegisterDto, UserUpdateDto } from "../../types/user.dto";

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
  async (req: Request<{}, {}, Partial<UserUpdateDto>>, res: Response) => {
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

    if (updateData.dob && typeof updateData.dob === 'string') {
      try {
        const dobDate = new Date(updateData.dob);
        
        if (isNaN(dobDate.getTime())) {
          return res.status(400).json(
            responseFormatter(false, "Invalid date format for date of birth")
          );
        }
        
        updateData.dob = dobDate.toISOString();
      } catch (error) {
        return res.status(400).json(
          responseFormatter(false, "Invalid date format for date of birth")
        );
      }
    }

    const updatedUser = await userService.updateUser(userId, updateData);
    res.status(200).json(
      responseFormatter(true, "User profile updated successfully", updatedUser)
    );
  }
);
