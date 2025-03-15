import { ErrorCode } from "../../enums/error-code.enum";
import prisma from "../../prisma";
import { ArtistRegisterDto } from "../../types/artist.dto";
import { BadRequestException } from "../../utils/catch-errors";

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
    const newArtist = await prisma.artist.create({
      data: {
        name,
        email,
        phone,
        password,
        dob,
        nrc_front: "Come back tmr",
      },
    });
  }
}
