import prisma from "../prisma";

class GenreService {
  public async createGenre(data: { name: string }) {
    const { name } = data;

    const newGenre = await prisma.genre.create({
      data: {
        name: name,
      },
    });

    return newGenre;
  }

  public async getGenres() {
    const genres = await prisma.genre.findMany();
    return genres;
  }

  public async updateGenre(genreId: string, name: string) {
    const existingGenre = await prisma.genre.findUnique({
      where: { id: genreId }
    });

    if (!existingGenre) {
      throw new Error("Genre not found");
    }

    const updatedGenre = await prisma.genre.update({
      where: { id: genreId },
      data: { name }
    });

    return updatedGenre;
  }

  public async deleteGenre(genreId: string) {
    const existingGenre = await prisma.genre.findUnique({
      where: { id: genreId }
    });

    if (!existingGenre) {
      throw new Error("Genre not found");
    }

    // Check if there are any tracks associated with this genre
    const associatedTracks = await prisma.track.findFirst({
      where: {
        genre_id: genreId
      }
    });

    if (associatedTracks) {
      throw new Error("Cannot delete genre with associated tracks");
    }

    const deletedGenre = await prisma.genre.delete({
      where: { id: genreId }
    });

    return deletedGenre;
  }
}
const genreService = new GenreService();
export default genreService;
