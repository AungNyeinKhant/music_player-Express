import { ErrorCode } from "../../enums/error-code.enum";
import prisma from "../../prisma";
import { AdminLoginDto, AdminRegisterDto } from "../../types/admin.dto";

import { BadRequestException } from "../../utils/catch-errors";
import { compareValue, hashValue } from "../../utils/helper";
import { refreshTokenSignOptions, signJwtToken } from "../../utils/jwt";
import { logger } from "../../utils/logger";

export default class AdminAuthService {
  public async registerService(registerData: AdminRegisterDto) {
    const { name, email, password, image, staff_id } = registerData;

    const existingUser = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const hashedPassword = await hashValue(password);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: image?.filename,
        staff_id,
      },
    });

    return {
      name: newAdmin.name,
      email: newAdmin.email,
      staff_id: newAdmin.staff_id,
    };
  }

  public async loginService(loginData: AdminLoginDto) {
    const { email, password } = loginData;
    logger.info(`Admin Login attempt for email: ${email}`);
    const admin = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });

    if (!admin) {
      logger.warn(`Admin Login failed: admin with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await compareValue(password, admin.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    logger.info(`Signing tokens for admin ID: ${admin.id}`);

    const accessToken = await signJwtToken({
      userId: admin.id,
      role: "admin",
    });

    const refreshToken = signJwtToken(
      {
        userId: admin.id,
        role: "admin",
        sessionId: 0,
      },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for admin ID: ${admin.id}`);

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        staff_id: admin.staff_id,
      },
      accessToken,
      refreshToken,
    };
  }
}
