import { config } from "../config/app.config";
import prisma from "../prisma";
import { BadRequestException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";
import { logger } from "../utils/logger";
import { UserRegisterDto } from "../types/user.dto";
import { hashValue } from "../utils/helper";

class UserService {
  public async getUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        image: true,
        valid_until: true,
        created_at: true,
        updated_at: true,
      },
    });

    return users.map((user) => ({
      ...user,
      image: user.image
        ? `${config.BACKEND_BASE_URL}/uploads/user/${user.image}`
        : null,
    }));
  }

  public async findUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        image: true,
        valid_until: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      logger.warn(`User not found with ID: ${userId}`);
      throw new BadRequestException(
        "User not found",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    return {
      ...user,
      image: user.image
        ? `${config.BACKEND_BASE_URL}/uploads/user/${user.image}`
        : null,
    };
  }

  public async updateUser(
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
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException(
        "User not found",
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

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id },
      data: prismaData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        image: true,
      },
    });

    return {
      ...updatedUser,
      image: updatedUser.image
        ? `${config.BACKEND_BASE_URL}/uploads/user/${updatedUser.image}`
        : null,
    };
  }

  public async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(
        "User not found",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully" };
  }
}

const userService = new UserService();
export default userService;
