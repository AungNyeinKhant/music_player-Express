import { Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import userService from "../../services/userService";
import { responseFormatter } from "../../utils/helper";
import { ParamsDictionary } from "express-serve-static-core";

export const getUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await userService.getUsers();
    res.status(200).json(
      responseFormatter(true, "Users retrieved successfully", users)
    );
  }
);

export const deleteUser = asyncHandler(
  async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.status(200).json(
      responseFormatter(true, "User deleted successfully", result)
    );
  }
);
