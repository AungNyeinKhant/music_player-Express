import { Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import artistService from "../../services/artistService";
import { responseFormatter } from "../../utils/helper";
import { getTokenData } from "../../utils/jwt";
import { ArtistRegisterDto } from "../../types/artist.dto";

export const getArtistProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getTokenData(req, res);
    const artist = await artistService.getArtistById(userId);
    res.status(200).json(
      responseFormatter(true, "Artist profile retrieved successfully", artist)
    );
  }
);

export const updateArtistProfile = asyncHandler(
  async (req: Request<{}, {}, Partial<ArtistRegisterDto>>, res: Response) => {
    const { userId } = getTokenData(req, res);
    
    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    const updateData = {
      ...req.body,
      image: files?.["image"]?.[0],
      bg_image: files?.["bg_image"]?.[0],
    };

    const updatedArtist = await artistService.updateArtist(userId, updateData);
    res.status(200).json(
      responseFormatter(true, "Artist profile updated successfully", updatedArtist)
    );
  }
);

