import { ErrorCode } from "../../enums/error-code.enum";
import prisma from "../../prisma";
import { UserLoginDto, UserRegisterDto } from "../../types/user.dto";
import { BadRequestException } from "../../utils/catch-errors";
import { compareValue, hashValue } from "../../utils/helper";
import { refreshTokenSignOptions, signJwtToken } from "../../utils/jwt";
import { logger } from "../../utils/logger";

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
        role: "artist",
        sessionId: 0,
      },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for artist ID: ${user.id}`);

    return {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
      },
      accessToken,
      refreshToken,
    };
  }
}
