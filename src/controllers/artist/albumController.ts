import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";

import albumService from "../../services/albumService";
import { createAlbumSchema } from "../../validator/album.validator";
import { AlbumDto } from "../../types/album.dto";
import { AccessPayload, getTokenData } from "../../utils/jwt";
import { responseFormatter } from "../../utils/helper";

export function getAlbumById(req: Request, res: Response) {
  res.status(200).json({ message: "Welcome from protected route" });
}

export const createAlbum = asyncHandler(
  async (
    req: Request<{}, {}, Omit<AlbumDto, "image" | "bg_image">>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { userId, role } = getTokenData(req, res);
    req.body.artist_id = userId;

    const body = createAlbumSchema.parse({
      ...req.body,
    });

    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    const registerData: AlbumDto = {
      ...body,
      image: files?.["image"] ? files["image"][0] : undefined,
      bg_image: files?.["bg_image"] ? files["bg_image"][0] : undefined,
    };

    const newAlbum = await albumService.createAlbum(registerData);

    return res
      .status(200)
      .json(responseFormatter(true, "Album created successfully", newAlbum));
  }
);

export const albumList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {}
);
