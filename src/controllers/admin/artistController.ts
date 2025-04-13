import { Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import artistService from "../../services/artistService";
import { responseFormatter } from "../../utils/helper";
import { getTokenData } from "../../utils/jwt";
import { ParamsDictionary } from "express-serve-static-core";

export const getArtists = asyncHandler(
  async (req: Request<{}, {}, {}, { search?: string }>, res: Response) => {
    const { search } = req.query;
    
    try {
      const artists = await artistService.getArtists(search);
      res.status(200).json(
        responseFormatter(true, "Artists retrieved successfully", artists)
      );
    } catch (error) {
      console.error("Error fetching artists:", error);
      return res
        .status(500)
        .json(responseFormatter(false, "Failed to fetch artists"));
    }
  }
);

export const deleteArtist = asyncHandler(
  async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { id } = req.params;
    const result = await artistService.deleteArtist(id);
    res.status(200).json(
      responseFormatter(true, "Artist deleted successfully", result)
    );
  }
);

;
