import prisma from "../prisma";
import { BadRequestException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";

interface AnalyticsParams {
  date: Date;
  type?: "monthly" | "yearly";
}

interface AnalyticsResponse {
  labels: number[];
  data: number[];
}

class AnalysisService {
  public async getPlayCountAnalytics(
    params: AnalyticsParams
  ): Promise<AnalyticsResponse> {
    const { date, type = "monthly" } = params;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (type === "monthly" && !month) {
      throw new BadRequestException("Month is required for monthly analytics");
    }

    const periodLength =
      type === "monthly" ? new Date(year, month!, 0).getDate() : 12;

    const playHistory =
      type === "monthly"
        ? await Promise.all(
            Array.from({ length: periodLength }, async (_, day) => {
              const startDate = new Date(year, month! - 1, day + 1);
              const endDate = new Date(year, month! - 1, day + 2);
              const result = await prisma.playHistory.count({
                where: {
                  created_at: {
                    gte: startDate,
                    lt: endDate,
                  },
                },
              });
              return { day: day + 1, count: result };
            })
          )
        : await Promise.all(
            Array.from({ length: 12 }, async (_, month) => {
              const startDate = new Date(year, month, 1);
              const endDate = new Date(year, month + 1, 1);
              const result = await prisma.playHistory.count({
                where: {
                  created_at: {
                    gte: startDate,
                    lt: endDate,
                  },
                },
              });
              return { month, count: result };
            })
          );

    const analytics = {
      labels: Array.from({ length: periodLength }, (_, i) => i + 1),
      data: Array(periodLength).fill(0),
    };

    playHistory.forEach((entry) => {
      if ("day" in entry) {
        analytics.data[entry.day - 1] = entry.count;
      } else {
        analytics.data[entry.month] = entry.count;
      }
    });

    return analytics;
  }

  public async getPurchaseAnalytics(
    params: AnalyticsParams
  ): Promise<{ counts: AnalyticsResponse; amounts: AnalyticsResponse }> {
    const { date, type = "monthly" } = params;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (type === "monthly" && !month) {
      throw new BadRequestException("Month is required for monthly analytics");
    }

    const purchases = await prisma.purchase.groupBy({
      by: ["created_at"],
      where: {
        AND: [
          {
            created_at:
              type === "monthly"
                ? {
                    gte: new Date(year, month! - 1, 1),
                    lt: new Date(year, month!, 1),
                  }
                : {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                  },
          },
        ],
      },
      _count: {
        id: true,
      },
      _sum: {
        price: true,
      },
    });

    const periodLength =
      type === "monthly" ? new Date(year, month!, 0).getDate() : 12;

    const analytics = {
      counts: {
        labels: Array.from({ length: periodLength }, (_, i) => i + 1),
        data: Array(periodLength).fill(0),
      },
      amounts: {
        labels: Array.from({ length: periodLength }, (_, i) => i + 1),
        data: Array(periodLength).fill(0),
      },
    };

    purchases.forEach((entry) => {
      const index =
        type === "monthly"
          ? entry.created_at.getDate() - 1
          : entry.created_at.getMonth();
      analytics.counts.data[index] = entry._count.id;
      analytics.amounts.data[index] = entry._sum.price || 0;
    });

    return analytics;
  }
}

export default new AnalysisService();
