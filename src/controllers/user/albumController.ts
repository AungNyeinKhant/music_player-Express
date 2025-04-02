import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import albumService from "../../services/albumService";
import { responseFormatter } from "../../utils/helper";

export const albumList = asyncHandler(
  async (
    req: Request<{}, {}, {}, { artist_id?: string; genre_id?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { artist_id, genre_id } = req.query;

    const albums = await albumService.getAlbums(artist_id, genre_id);

    return res
      .status(200)
      .json(responseFormatter(true, "Albums fetched successfully", albums));
  }
);
