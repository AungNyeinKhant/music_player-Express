import { Request, Response } from "express";
import adminService from "../../services/adminService";
import { asyncHandler } from "../../middleware/asyncHandler";
import { responseFormatter } from "../../utils/helper";

export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;
  if (files?.["image"]) {
    updateData.image = files["image"][0];
  }
  const updatedAdmin = await adminService.updateAdmin(id, updateData);
  res
    .status(200)
    .json(responseFormatter(true, "Admin updated successfully", updatedAdmin));
});

export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await adminService.deleteAdmin(id);
  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  });
});
