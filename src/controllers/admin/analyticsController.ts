import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import analysisService from "../../services/analysisService";
import { responseFormatter } from "../../utils/helper";

export const getPlayCountAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { date: dateStr, type = "monthly" } = req.query;

    if (!dateStr) {
      return res
        .status(400)
        .json(responseFormatter(false, "Date parameter is required"));
    }

    const date = new Date(dateStr as string);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json(responseFormatter(false, "Invalid date format"));
    }
    date.setDate(1); // Reset to first day of month

    const analytics = await analysisService.getPlayCountAnalytics({
      date,
      type: type as "monthly" | "yearly",
    });

    return res
      .status(200)
      .json(
        responseFormatter(true, "Play count analytics retrieved", analytics)
      );
  }
);

export const getPurchaseAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { date: dateStr, type = "monthly" } = req.query;

    if (!dateStr) {
      return res
        .status(400)
        .json(responseFormatter(false, "Date parameter is required"));
    }

    const date = new Date(dateStr as string);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json(responseFormatter(false, "Invalid date format"));
    }
    date.setDate(1); // Reset to first day of month

    const analytics = await analysisService.getPurchaseAnalytics({
      date,
      type: type as "monthly" | "yearly",
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Purchase analytics retrieved", analytics));
  }
);

export const getTopArtists = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { date: dateStr, type = "monthly" } = req.query;

    if (!dateStr) {
      return res
        .status(400)
        .json(responseFormatter(false, "Date parameter is required"));
    }

    const date = new Date(dateStr as string);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json(responseFormatter(false, "Invalid date format"));
    }
    date.setDate(1); // Reset to first day of month

    const analytics = await analysisService.getTopArtistsAnalytics({
      date,
      type: type as "monthly" | "yearly",
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Top artists retrieved", analytics));
  }
);

export const getTopGenres = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { date: dateStr, type = "monthly" } = req.query;

    if (!dateStr) {
      return res
        .status(400)
        .json(responseFormatter(false, "Date parameter is required"));
    }

    const date = new Date(dateStr as string);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json(responseFormatter(false, "Invalid date format"));
    }
    date.setDate(1); // Reset to first day of month

    const analytics = await analysisService.getTopGenresAnalytics({
      date,
      type: type as "monthly" | "yearly",
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Top genres retrieved", analytics));
  }
);

export const getTopAlbums = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { date: dateStr, type = "monthly" } = req.query;

    if (!dateStr) {
      return res
        .status(400)
        .json(responseFormatter(false, "Date parameter is required"));
    }

    const date = new Date(dateStr as string);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json(responseFormatter(false, "Invalid date format"));
    }
    date.setDate(1); // Reset to first day of month

    const analytics = await analysisService.getTopAlbumsAnalytics({
      date,
      type: type as "monthly" | "yearly",
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Top albums retrieved", analytics));
  }
);

export const getMonthlyTotalAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const analytics = await analysisService.getMonthlyTotalAnalytics();
    return res
      .status(200)
      .json(
        responseFormatter(
          true,
          "Monthly total analytics retrieved successfully",
          analytics
        )
      );
  }
);
