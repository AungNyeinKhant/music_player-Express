import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { responseFormatter } from "../../utils/helper";
import genreService from "../../services/genreService";

export const genreList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const genres = await genreService.getGenres();
    return res
      .status(200)
      .json(responseFormatter(true, "Genres fetched successfully", genres));
  }
);

export const createGenre = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const name = req.body.name;
    if (!name) {
      return res
        .status(400)
        .json(responseFormatter(false, "Name field required"));
    }

    const genre = await genreService.createGenre({ name });

    return res
      .status(201)
      .json(responseFormatter(true, "Genre created successfully", genre));
  }
);

export const updateGenre = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(responseFormatter(false, "Name field required"));
    }

    const updatedGenre = await genreService.updateGenre(id, name);

    return res
      .status(200)
      .json(responseFormatter(true, "Genre updated successfully", updatedGenre));
  }
);

export const deleteGenre = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;

    const deletedGenre = await genreService.deleteGenre(id);

    return res
      .status(200)
      .json(responseFormatter(true, "Genre deleted successfully", deletedGenre));
  }
);
