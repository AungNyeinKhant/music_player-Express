import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getTokenData } from "../../utils/jwt";
import {
  createTrackSchema,
  playTrackSchema,
} from "../../validator/track.validator";
import { TrackDto } from "../../types/track.dto";
import trackService from "../../services/trackService";
import { responseFormatter } from "../../utils/helper";

export const getTracksByAlbumId = asyncHandler(
  async (
    req: Request<{}, {}, {}, { album_id?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { album_id } = req.query;

    if (!album_id) {
      return res
        .status(400)
        .json(responseFormatter(false, "Album ID is required"));
    }

    const tracks = await trackService.getTracksByAlbumId(album_id);
    return res
      .status(200)
      .json(responseFormatter(true, "Tracks fetched successfully", tracks));
  }
);

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

export const deleteTrack = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { userId } = getTokenData(req, res);

    try {
      const result = await trackService.deleteTrack(id, userId);
      return res
        .status(200)
        .json(responseFormatter(true, "Track deleted successfully", { id }));
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(404)
          .json(responseFormatter(false, error.message));
      }
      throw error;
    }
  }
);

export const getTrackDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;

    try {
      const track = await trackService.getTrackDetail(id);
      return res
        .status(200)
        .json(responseFormatter(true, "Track details fetched successfully", track));
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(404)
          .json(responseFormatter(false, error.message));
      }
      throw error;
    }
  }
);

export const updateTrack = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { userId } = getTokenData(req, res);

    try {
      // Validate the input data
      const body = createTrackSchema.partial().parse({
        ...req.body,
      });

      // Process files
      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const updateData = {
        ...body,
        audio: files?.["audio"] ? files["audio"][0] : undefined,
      };

      const updatedTrack = await trackService.updateTrack(id, userId, updateData);

      return res
        .status(200)
        .json(responseFormatter(true, "Track updated successfully", updatedTrack));
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(400)
          .json(responseFormatter(false, error.message));
      }
      throw error;
    }
  }
);
