import { ErrorCode } from "../../enums/error-code.enum";
import prisma from "../../prisma";
import { UserLoginDto, UserRegisterDto } from "../../types/user.dto";
import { BadRequestException } from "../../utils/catch-errors";
import { compareValue, hashValue } from "../../utils/helper";
import {
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
  RefreshPayload,
} from "../../utils/jwt";
import { logger } from "../../utils/logger";
import { config } from "../../config/app.config";

type RefreshTokenResponse = {
  role: "user" | "artist" | "admin";
  id: string;
  accessToken: string;
  image?: string | null;
  name?: string | null;
};

export default class UserAuthService {
  public async registerService(registerData: UserRegisterDto) {
    const { name, email, phone, password, dob, image } = registerData;
    const nextTwoWeek = new Date(
      new Date().getTime() + 14 * 24 * 60 * 60 * 1000
    );

    const existingUser = await prisma.artist.findUnique({
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

    const newArtist = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        dob: new Date(dob),
        image: image?.filename,
        valid_until: nextTwoWeek,
      },
    });

    logger.info(`New User created: ${newArtist.id} - ${newArtist.name}`);

    /*
    return {
      name: newArtist.name,
      email: newArtist.email,
      phone: newArtist.phone,
      dob: newArtist.dob,
    };
    */
    return this.loginService({ email, password });
  }

  public async loginService(loginData: UserLoginDto) {
    const { email, password } = loginData;
    logger.info(`User Login attempt for email: ${email}`);
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      logger.warn(`User Login failed: user with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.CREDENTIAL_DIDNT_MATCH
      );
    }

    logger.info(`Signing tokens for user ID: ${user.id}`);

    const accessToken = await signJwtToken({
      userId: user.id,
      role: "user",
    });

    const refreshToken = signJwtToken(
      {
        userId: user.id,
        role: "user",
        sessionId: 0,
      },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for artist ID: ${user.id}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: `${config.BACKEND_BASE_URL}/user/image/${user.image}`,
        dob: user.dob,
      },
      accessToken,
      refreshToken,
    };
  }

  public async refreshTokenService(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    // Verify the refresh token
    const { payload, error } = verifyJwtToken<RefreshPayload>(refreshToken, {
      secret: config.JWT.REFRESH_SECRET,
    });
    logger.info(
      "Attempting to refresh access token for role",
      payload?.role,
      "and id",
      payload?.userId
    );

    if (error || !payload) {
      logger.warn("Invalid refresh token provided");
      throw new BadRequestException(
        "Invalid refresh token",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    let user;
    // Find the user based on the role and ID from the refresh token
    if (payload.role === "user") {
      user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) {
        logger.warn(`User not found for refresh token: ${payload.userId}`);
        throw new BadRequestException(
          "User not found",
          ErrorCode.AUTH_USER_NOT_FOUND
        );
      }

      logger.info(`Generating new access token for user ID: ${user.id}`);

      const accessToken = await signJwtToken({
        userId: user.id,
        role: "user",
      });

      return {
        role: payload.role,
        id: payload.userId,
        accessToken,
        image: user.image ? `${config.BACKEND_BASE_URL}/uploads/user/${user.image}` : null,
        name: user.name,
      };
    } else if (payload.role === "artist") {
      user = await prisma.artist.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) {
        logger.warn(`Artist not found for refresh token: ${payload.userId}`);
        throw new BadRequestException(
          "Artist not found",
          ErrorCode.AUTH_USER_NOT_FOUND
        );
      }

      logger.info(`Generating new access token for artist ID: ${user.id}`);

      const accessToken = await signJwtToken({
        userId: user.id,
        role: "artist",
      });

      return {
        role: payload.role,
        id: payload.userId,
        accessToken,
        name: user.name,
        image: user.image ? `${config.BACKEND_BASE_URL}/uploads/artist/${user.image}` : null,
      };
    } else if (payload.role === "admin") {
      user = await prisma.admin.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) {
        logger.warn(`Admin not found for refresh token: ${payload.userId}`);
        throw new BadRequestException(
          "Admin not found",
          ErrorCode.AUTH_USER_NOT_FOUND
        );
      }

      logger.info(`Generating new access token for admin ID: ${user.id}`);

      const accessToken = await signJwtToken({
        userId: user.id,
        role: "admin",
      });

      return {
        role: payload.role,
        id: payload.userId,
        name: user.name,
        accessToken,
        image: user.image ? `${config.BACKEND_BASE_URL}/uploads/admin/${user.image}` : null,
      };
    }

    // If we get here, the role is invalid
    throw new BadRequestException(
      "Invalid role in refresh token",
      ErrorCode.AUTH_INVALID_TOKEN
    );
  }
}
