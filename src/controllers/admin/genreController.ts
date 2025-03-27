import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { responseFormatter } from "../../utils/helper";
import genreService from "../../services/genreService";

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
