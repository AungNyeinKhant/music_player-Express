import { config } from "../config/app.config";
import prisma from "../prisma";
import { BadRequestException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";
import { hashValue } from "../utils/helper";

class AdminService {
  public async deleteAdmin(id: string): Promise<void> {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new BadRequestException(
        "Admin not found",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    // Delete the admin
    await prisma.admin.delete({
      where: { id },
    });
  }

  public async updateAdmin(
    id: string,
    updateData: Partial<{
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      image?: Express.Multer.File;
      dob?: string;
    }>
  ): Promise<any> {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new BadRequestException(
        "Admin not found",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    // Prepare data for Prisma update
    const prismaData: any = { ...updateData };

    // Handle password hashing if provided
    if (updateData.password) {
      prismaData.password = await hashValue(updateData.password);
    }

    // Handle file updates
    if (updateData.image) {
      prismaData.image = updateData.image.filename;
    }

    // Update admin data
    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: prismaData,
      select: {
        id: true,
        name: true,
        email: true,
        staff_id: true,

        image: true,
      },
    });

    return {
      ...updatedAdmin,
      image: updatedAdmin.image
        ? `${config.BACKEND_BASE_URL}/uploads/admin/${updatedAdmin.image}`
        : null,
    };
  }
}
const adminService = new AdminService();
export default adminService;
