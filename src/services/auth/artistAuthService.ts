import { config } from "../../config/app.config";
import { ErrorCode } from "../../enums/error-code.enum";
import prisma from "../../prisma";
import { ArtistLoginDto, ArtistRegisterDto } from "../../types/artist.dto";
import { BadRequestException } from "../../utils/catch-errors";
import { compareValue, hashValue } from "../../utils/helper";
import { refreshTokenSignOptions, signJwtToken } from "../../utils/jwt";
import { logger } from "../../utils/logger";

export default class ArtistAuthService {
  public async registerService(registerData: ArtistRegisterDto) {
    const {
      name,
      email,
      phone,
      password,
      dob,
      image,
      bg_image,
      nrc_front,
      nrc_back,
    } = registerData;

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

    const newArtist = await prisma.artist.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        dob: new Date(dob),
        image: image?.filename,
        bg_image: bg_image?.filename,
        nrc_front: nrc_front?.filename,
        nrc_back: nrc_back?.filename,
      },
    });

    logger.info(`New Artist created: ${newArtist.id} - ${newArtist.name}`);

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

  public async loginService(loginData: ArtistLoginDto) {
    const { email, password } = loginData;
    logger.info(`Artist Login attempt for email: ${email}`);
    const artist = await prisma.artist.findUnique({
      where: {
        email: email,
      },
    });

    if (!artist) {
      logger.warn(`Artist Login failed: artist with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await compareValue(password, artist.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.CREDENTIAL_DIDNT_MATCH
      );
    }

    logger.info(`Signing tokens for user ID: ${artist.id}`);

    const accessToken = await signJwtToken({
      userId: artist.id,
      role: "artist",
    });

    const refreshToken = signJwtToken(
      {
        userId: artist.id,
        role: "artist",
        sessionId: 0,
      },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for artist ID: ${artist.id}`);

    return {
      user: {
        id: artist.id,
        name: artist.name,
        email: artist.email,
        phone: artist.phone,
        dob: artist.dob,
        image: `${config.BACKEND_BASE_URL}/artist/image/${artist.image}`,
      },
      accessToken,
      refreshToken,
    };
  }
}
