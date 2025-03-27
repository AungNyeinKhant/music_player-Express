import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getTokenData } from "../../utils/jwt";
import {
  limitOffsetSchema,
  playTrackSchema,
} from "../../validator/track.validator";
import trackService from "../../services/trackService";
import { responseFormatter } from "../../utils/helper";

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

export const trendingTracks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const body = limitOffsetSchema.parse({
      ...req.query,
    });

    const trendingTracks = await trackService.getTrendingTracks(body);
    return res
      .status(200)
      .json(responseFormatter(true, "Trending tracks found", trendingTracks));
  }
);

export const mostListenTracks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const limit = req.query.limit;
    if (!limit) {
      return res.status(400).json(responseFormatter(false, "limit required"));
    }

    const mostListenSongs = await trackService.getMostListenTrack({
      limit,
    });
    return res
      .status(200)
      .json(
        responseFormatter(true, "Most Listen tracks found", mostListenSongs)
      );
  }
);

export const recentTracks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit;
    if (!limit) {
      return res.status(400).json(responseFormatter(false, "limit required"));
    }
    const { userId, role } = getTokenData(req, res);

    const recentListenTracks = await trackService.getRecentTracks({
      limit,
      userId,
    });
    return res
      .status(200)
      .json(responseFormatter(true, "Recent tracks found", recentListenTracks));
  }
);
