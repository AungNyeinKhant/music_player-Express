import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import genreService from "../../services/genreService";
import { responseFormatter } from "../../utils/helper";

export const genreList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const genres = await genreService.getGenres();
    return res
      .status(200)
      .json(responseFormatter(true, "Genres fetched successfully", genres));
  }
);
