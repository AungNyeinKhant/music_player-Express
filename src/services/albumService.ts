import { config } from "../config/app.config";
import prisma from "../prisma";
import { AlbumDto } from "../types/album.dto";

class AlbumService {
  public async createAlbum(createAlbumData: AlbumDto) {
    const { name, description, image, bg_image, artist_id, genre_id } =
      createAlbumData;

    const newAlbum = await prisma.album.create({
      data: {
        name,
        description,
        image: image?.filename,
        bg_image: bg_image?.filename,
        artist_id,
        genre_id,
      },
    });

    return {
      name: newAlbum.name,
      description: newAlbum.description,
      artist_id: newAlbum.artist_id,
      genre_id: newAlbum.genre_id,
    };
  }

  public async getAlbums(param: {
    artist_id?: string;
    genre_id?: string;
    search?: string;
  }) {
    let whereCondition: any = {};
    const { artist_id, genre_id, search } = param;

    if (artist_id) {
      whereCondition = { artist_id };
    } else if (genre_id) {
      whereCondition = { genre_id };
    } else if (search) {
      whereCondition = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const albums = await prisma.album.findMany({
      where: whereCondition,
      include: {
        artist: {
          select: {
            name: true,
            image: true,
          },
        },
        genre: {
          select: {
            name: true,
          },
        },
      },
    });

    // Process image URLs if needed
    const processedAlbums = albums.map((album) => ({
      ...album,
      image: album.image
        ? `${config.BACKEND_BASE_URL}/uploads/album/${album.image}`
        : null,
      bg_image: album.bg_image
        ? `${config.BACKEND_BASE_URL}/uploads/album/${album.bg_image}`
        : null,
      artist: album.artist
        ? {
            ...album.artist,
            image: album.artist.image
              ? `${config.BACKEND_BASE_URL}/uploads/artist/${album.artist.image}`
              : null,
          }
        : null,
    }));

    return processedAlbums;
  }

  public async getMostPlayedAlbums() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const mostPlayedAlbums = await prisma.playHistory.groupBy({
      by: ["album_id"],
      where: {
        created_at: {
          gte: startDate,
        },
      },
      _count: {
        album_id: true,
      },
      orderBy: {
        _count: {
          album_id: "desc",
        },
      },
      take: 3,
    });

    const albumIds = [
      ...new Set(mostPlayedAlbums.map((album) => album.album_id)),
    ];

    // Get the albums with their related data
    const albums = await prisma.album.findMany({
      where: {
        id: {
          in: albumIds,
        },
      },
      include: {
        artist: {
          select: {
            name: true,
            image: true,
          },
        },
        genre: {
          select: {
            name: true,
          },
        },
      },
    });

    // Process image URLs
    const processedAlbums = albums.map((album) => ({
      ...album,
      image: album.image
        ? `${config.BACKEND_BASE_URL}/uploads/album/${album.image}`
        : null,
      bg_image: album.bg_image
        ? `${config.BACKEND_BASE_URL}/uploads/album/${album.bg_image}`
        : null,
      artist: album.artist
        ? {
            ...album.artist,
            image: album.artist.image
              ? `${config.BACKEND_BASE_URL}/uploads/artist/${album.artist.image}`
              : null,
          }
        : null,
    }));

    return processedAlbums;
  }

  public async getAlbumById(id: string) {
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            name: true,
            image: true,
          },
        },
        genre: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!album) {
      throw new Error("Album not found");
    }

    // Process image URLs
    const processedAlbum = {
      ...album,
      image: album.image
        ? `${config.BACKEND_BASE_URL}/uploads/album/${album.image}`
        : null,
      bg_image: album.bg_image
        ? `${config.BACKEND_BASE_URL}/uploads/album/${album.bg_image}`
        : null,
      artist: album.artist
        ? {
            ...album.artist,
            image: album.artist.image
              ? `${config.BACKEND_BASE_URL}/uploads/artist/${album.artist.image}`
              : null,
          }
        : null,
    };

    return processedAlbum;
  }
}
const albumService = new AlbumService();
export default albumService;
