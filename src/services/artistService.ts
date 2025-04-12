import { config } from "../config/app.config";
import prisma from "../prisma";
import { BadRequestException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";
import { logger } from "../utils/logger";

import { hashValue } from "../utils/helper";

class ArtistService {
  public async getArtists(search?: string) {
    const whereCondition = search && typeof search === 'string' ? {
      name: {
        contains: search,
        mode: "insensitive" as const,
      },
    } : {};

    const artists = await prisma.artist.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        image: true,
        bg_image: true,
        nrc_front: true,
        nrc_back: true,
        created_at: true,
        updated_at: true,
      },
    });

    return artists.map((artist) => ({
      ...artist,
      image: artist.image
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${artist.image}`
        : null,
      bg_image: artist.bg_image
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${artist.bg_image}`
        : null,
      nrc_front: artist.nrc_front
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${artist.nrc_front}`
        : null,
      nrc_back: artist.nrc_back
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${artist.nrc_back}`
        : null,
    }));
  }

  public async getArtistById(id: string) {
    const artist = await prisma.artist.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        image: true,
        bg_image: true,
        created_at: true,
      },
    });

    if (!artist) {
      logger.warn(`Artist not found with ID: ${id}`);
      throw new BadRequestException(
        "Artist not found",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    return {
      ...artist,
      image: artist.image
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${artist.image}`
        : null,
      bg_image: artist.bg_image
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${artist.bg_image}`
        : null,
    };
  }

  public async updateArtist(
    id: string,
    updateData: Partial<{
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      image?: Express.Multer.File;
      bg_image?: Express.Multer.File;
      dob?: string;
    }>
  ): Promise<any> {
    const artist = await prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new BadRequestException(
        "Artist not found",
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

    if (updateData.bg_image) {
      prismaData.bg_image = updateData.bg_image.filename;
    }

    // Update artist data
    const updatedArtist = await prisma.artist.update({
      where: { id },
      data: prismaData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        image: true,
        bg_image: true,
      },
    });

    return {
      ...updatedArtist,
      image: updatedArtist.image
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${updatedArtist.image}`
        : null,
      bg_image: updatedArtist.bg_image
        ? `${config.BACKEND_BASE_URL}/uploads/artist/${updatedArtist.bg_image}`
        : null,
    };
  }

  public async deleteArtist(id: string): Promise<boolean> {
    const artist = await prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new BadRequestException(
        "Artist not found",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    // Delete artist record
    await prisma.artist.delete({
      where: { id },
    });

    return true;
  }
}

const artistService = new ArtistService();
export default artistService;
