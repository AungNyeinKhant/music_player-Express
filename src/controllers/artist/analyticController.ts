import { NextFunction, Request, Response } from "express-serve-static-core";
import { asyncHandler } from "../../middleware/asyncHandler";
import analysisService from "../../services/analysisService";
import { responseFormatter } from "../../utils/helper";
import { getTokenData } from "../../utils/jwt";

export const getPlayCountAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { userId } = getTokenData(req, res);
    const { date, type } = req.query;

    // Validate date parameter
    let analyticsDate: Date;
    if (date && typeof date === "string") {
      analyticsDate = new Date(date);
      if (isNaN(analyticsDate.getTime())) {
        return res
          .status(400)
          .json(responseFormatter(false, "Invalid date format"));
      }
    } else {
      analyticsDate = new Date();
    }

    // Validate type parameter
    const analyticsType = type === "yearly" ? "yearly" : "monthly";

    try {
      const analytics = await analysisService.getPlayCountArtistAnalytics({
        date: analyticsDate,
        type: analyticsType,
        artist_id: userId,
      });

      return res
        .status(200)
        .json(
          responseFormatter(true, "Play count analytics fetched successfully", analytics)
        );
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json(responseFormatter(false, error.message));
      }
      throw error;
    }
  }
);
