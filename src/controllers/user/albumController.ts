import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import albumService from "../../services/albumService";
import { responseFormatter } from "../../utils/helper";

export const albumList = asyncHandler(
  async (
    req: Request<
      {},
      {},
      {},
      { artist_id?: string; genre_id?: string; search?: string }
    >,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { artist_id, genre_id, search } = req.query;

    const albums = await albumService.getAlbums({
      artist_id,
      genre_id,
      search,
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Albums fetched successfully", albums));
  }
);

export const mostPlayedAlbums = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const albums = await albumService.getMostPlayedAlbums();

    return res
      .status(200)
      .json(
        responseFormatter(
          true,
          "Most played albums fetched successfully",
          albums
        )
      );
  }
);

export const getAlbumById = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { id } = req.params;

    try {
      const album = await albumService.getAlbumById(id);
      return res
        .status(200)
        .json(responseFormatter(true, "Album fetched successfully", album));
    } catch (error) {
      if (error instanceof Error && error.message === "Album not found") {
        return res
          .status(404)
          .json(responseFormatter(false, "Album not found"));
      }
      throw error;
    }
  }
);
