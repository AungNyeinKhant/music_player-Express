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

  public async getAlbums(
    artist_id?: string,
    genre_id?: string,
    search?: string
  ) {
    let whereCondition: any = {};

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
}
const albumService = new AlbumService();
export default albumService;
