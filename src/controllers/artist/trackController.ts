import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getTokenData } from "../../utils/jwt";
import {
  createTrackSchema,
  playTrackSchema,
} from "../../validator/track.validator";
import { TrackDto } from "../../types/track.dto";
import trackService from "../../services/trackService";
import { responseFormatter } from "../../utils/helper";

export const createTrack = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { userId, role } = getTokenData(req, res);
    req.body.artist_id = userId;

    const body = createTrackSchema.parse({
      ...req.body,
    });

    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    if (!files?.["audio"]) {
      return res
        .status(400)
        .json(responseFormatter(false, "Audio file is required"));
    }

    const registerData: TrackDto = {
      ...body,
      audio: files["audio"][0],
    };

    const newTrack = await trackService.createTrack(registerData);

    return res
      .status(200)
      .json(responseFormatter(true, "Track created successfully", newTrack));
  }
);

export const playTrack = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { userId, role } = getTokenData(req, res);
    req.body.user_id = userId;

    const body = playTrackSchema.parse({
      ...req.body,
    });

    const track = await trackService.playTrack(body);
    return res
      .status(200)
      .json(responseFormatter(true, "Track Play recorded successfully", track));
  }
);
