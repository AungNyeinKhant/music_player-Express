import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import artistService from "../../services/artistService";
import { responseFormatter } from "../../utils/helper";

export const artistList = asyncHandler(
  async (
    req: Request<{}, {}, {}, { search?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { search } = req.query;
    
    try {
      const artists = await artistService.getArtists(search);
      
      return res
        .status(200)
        .json(responseFormatter(true, "Artists fetched successfully", artists));
    } catch (error) {
      console.error("Error fetching artists:", error);
      return res
        .status(500)
        .json(responseFormatter(false, "Failed to fetch artists"));
    }
  }
);

export const getArtistById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    
    try {
      const artist = await artistService.getArtistById(id);
      return res
        .status(200)
        .json(responseFormatter(true, "Artist fetched successfully", artist));
    } catch (error) {
      if (error instanceof Error && error.message === "Artist not found") {
        return res
          .status(404)
          .json(responseFormatter(false, "Artist not found"));
      }
      throw error;
    }
  }
);
