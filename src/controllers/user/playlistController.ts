import { Request, Response, NextFunction } from "express";
import { responseFormatter } from "../../utils/helper";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getTokenData } from "../../utils/jwt";
import playlistService from "../../services/playlistService";

export const getPlaylists = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const payload = getTokenData(req, res);
    const user_id = payload.userId;

    const playlists = await playlistService.getPlaylistsByUserId(user_id);
    const response = responseFormatter(
      true,
      "Playlists retrieved successfully",
      playlists
    );
    return res.status(200).json(response);
  }
);

export const createPlaylist = asyncHandler(
  async (
    req: Request<{}, {}, { name: string }>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(responseFormatter(false, "Playlist name is required"));
    }

    const payload = getTokenData(req, res);
    const user_id = payload.userId;

    const playlist = await playlistService.createPlaylist(name, user_id);
    const response = responseFormatter(
      true,
      "Playlist created successfully",
      playlist
    );
    return res.status(201).json(response);
  }
);

export const handleTrack_Playlist = asyncHandler(
  async (
    req: Request<{}, {}, { playlist_id: string; track_id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { playlist_id, track_id } = req.body;

    if (!playlist_id || !track_id) {
      return res
        .status(400)
        .json(
          responseFormatter(false, "Playlist ID and Track ID are required")
        );
    }

    const playlistTrack = await playlistService.handleTrackToPlaylist(
      playlist_id,
      track_id
    );
    const response = responseFormatter(
      true,
      "Track added to playlist successfully",
      playlistTrack
    );
    return res.status(201).json(response);
  }
);
