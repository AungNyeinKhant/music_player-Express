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
}
const albumService = new AlbumService();
export default albumService;
