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
}
const genreService = new GenreService();
export default genreService;
