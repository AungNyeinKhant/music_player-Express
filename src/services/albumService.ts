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

  public async getAlbums(artist_id?: string, genre_id?: string) {
    let whereCondition = {};

    if (artist_id) {
      whereCondition = { artist_id };
    } else if (genre_id) {
      whereCondition = { genre_id };
    }

    const albums = await prisma.album.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        bg_image: true,
        artist_id: true,
        genre_id: true,
        created_at: true,
      },
    });

    return albums;
  }
}
const albumService = new AlbumService();
export default albumService;
