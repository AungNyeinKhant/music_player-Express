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
}
const genreService = new GenreService();
export default genreService;
