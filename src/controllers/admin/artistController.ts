import { Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import artistService from "../../services/artistService";
import { responseFormatter } from "../../utils/helper";
import { getTokenData } from "../../utils/jwt";
import { ParamsDictionary } from "express-serve-static-core";

export const getArtists = asyncHandler(
  async (req: Request, res: Response) => {
    
    const artists = await artistService.getArtists();
    res.status(200).json(
      responseFormatter(true, "Artists retrieved successfully", artists)
    );
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
