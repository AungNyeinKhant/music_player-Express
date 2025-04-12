import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";

import albumService from "../../services/albumService";
import { createAlbumSchema } from "../../validator/album.validator";
import { AlbumDto } from "../../types/album.dto";
import { AccessPayload, getTokenData } from "../../utils/jwt";
import { responseFormatter } from "../../utils/helper";

export const createAlbum = asyncHandler(
  async (
    req: Request<{}, {}, Omit<AlbumDto, "image" | "bg_image">>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const payload = getTokenData(req, res);
    req.body.artist_id = payload.userId;

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
  async (
    req: Request<{}, {}, {}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const payload = getTokenData(req, res);
    const artist_id = payload.userId;

    const albums = await albumService.getAlbums({ artist_id });

    return res
      .status(200)
      .json(responseFormatter(true, "Albums fetched successfully", albums));
  }
);

export const deleteAlbum = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { id } = req.params;
    const payload = getTokenData(req, res);
    const artist_id = payload.userId;

    try {
      const result = await albumService.deleteAlbum(id, artist_id);
      return res
        .status(200)
        .json(responseFormatter(true, "Album deleted successfully", { id }));
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

export const updateAlbum = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { id } = req.params;
    const payload = getTokenData(req, res);
    const artist_id = payload.userId;

    try {
      // Validate the input data if needed
      // You can use the same schema or a partial version of it
      const body = createAlbumSchema.partial().parse({
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
        image: files?.["image"] ? files["image"][0] : undefined,
        bg_image: files?.["bg_image"] ? files["bg_image"][0] : undefined,
      };

      const updatedAlbum = await albumService.updateAlbum(id, artist_id, updateData);

      return res
        .status(200)
        .json(responseFormatter(true, "Album updated successfully", updatedAlbum));
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