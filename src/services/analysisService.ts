import prisma from "../prisma";
import { BadRequestException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";

interface AnalyticsParams {
  date: Date;
  type?: "monthly" | "yearly";
}

interface AnalyticsResponse {
  labels: number[] | string[];
  data: TopItemAnalyticsResponse[][];
}

interface TopItemAnalyticsResponse {
  id: string;
  name: string;
  count: number;
}

interface MonthlyTotalAnalyticsResponse {
  totalPlayCount: number;
  totalPurchaseAmount: number;
}

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

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
      labels:
        type === "monthly"
          ? Array.from({ length: periodLength }, (_, i) => i + 1)
          : MONTH_LABELS,
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
  ): Promise<AnalyticsResponse> {
    const { date, type = "monthly" } = params;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (type === "monthly" && !month) {
      throw new BadRequestException("Month is required for monthly analytics");
    }

    const periodLength =
      type === "monthly" ? new Date(year, month!, 0).getDate() : 12;

    const purchaseHistory =
      type === "monthly"
        ? await Promise.all(
            Array.from({ length: periodLength }, async (_, day) => {
              const startDate = new Date(year, month! - 1, day + 1);
              const endDate = new Date(year, month! - 1, day + 2);
              const result = await prisma.purchase.aggregate({
                where: {
                  created_at: {
                    gte: startDate,
                    lt: endDate,
                  },
                  status: "APPROVED",
                },
                _count: {
                  id: true,
                },
                _sum: {
                  price: true,
                },
              });
              return {
                day: day + 1,
                count: result._count.id,
                amount: result._sum.price || 0,
              };
            })
          )
        : await Promise.all(
            Array.from({ length: 12 }, async (_, month) => {
              const startDate = new Date(year, month, 1);
              const endDate = new Date(year, month + 1, 1);
              const result = await prisma.purchase.aggregate({
                where: {
                  created_at: {
                    gte: startDate,
                    lt: endDate,
                  },
                  status: "APPROVED",
                },
                _count: {
                  id: true,
                },
                _sum: {
                  price: true,
                },
              });
              return {
                month,
                count: result._count.id,
                amount: result._sum.price || 0,
              };
            })
          );

    const analytics = {
      counts: {
        labels:
          type === "monthly"
            ? Array.from({ length: periodLength }, (_, i) => i + 1)
            : MONTH_LABELS,
        data: Array(periodLength).fill(0),
      },
      amounts: {
        labels:
          type === "monthly"
            ? Array.from({ length: periodLength }, (_, i) => i + 1)
            : MONTH_LABELS,
        data: Array(periodLength).fill(0),
      },
    };

    purchaseHistory.forEach((entry) => {
      if ("day" in entry) {
        analytics.counts.data[entry.day - 1] = entry.count;
        analytics.amounts.data[entry.day - 1] = entry.amount;
      } else {
        analytics.counts.data[entry.month] = entry.count;
        analytics.amounts.data[entry.month] = entry.amount;
      }
    });

    return analytics.amounts;
  }

  public async getTopArtistsAnalytics(
    params: AnalyticsParams
  ): Promise<AnalyticsResponse> {
    const { date, type = "monthly" } = params;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (type === "monthly" && !month) {
      throw new BadRequestException("Month is required for monthly analytics");
    }

    const periodLength = type === "monthly" ? 1 : 12;
    const monthsToProcess =
      type === "monthly"
        ? [month]
        : Array.from({ length: 12 }, (_, i) => i + 1);

    const monthlyData = await Promise.all(
      monthsToProcess.map(async (currentMonth) => {
        const startDate = new Date(year, currentMonth - 1, 1);
        const endDate = new Date(year, currentMonth, 0);

        const topArtists = await prisma.playHistory.findMany({
          where: {
            created_at: {
              gte: startDate,
              lt: endDate,
            },
          },
          select: {
            track: {
              select: {
                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        const artistCounts = topArtists.reduce((acc, play) => {
          const artistId = String(play.track?.artist?.id || 0);
          const artistName = play.track?.artist?.name || "Unknown";

          if (!acc[artistId]) {
            acc[artistId] = {
              id: artistId,
              name: artistName,
              count: 0,
            };
          }
          acc[artistId].count++;
          return acc;
        }, {} as Record<string, TopItemAnalyticsResponse>);

        return Object.values(artistCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      })
    );

    return {
      labels: type === "monthly" ? monthsToProcess : MONTH_LABELS,
      data: monthlyData,
    };
  }

  public async getTopGenresAnalytics(
    params: AnalyticsParams
  ): Promise<AnalyticsResponse> {
    const { date, type = "monthly" } = params;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (type === "monthly" && !month) {
      throw new BadRequestException("Month is required for monthly analytics");
    }

    const periodLength = type === "monthly" ? 1 : 12;
    const monthsToProcess =
      type === "monthly"
        ? [month]
        : Array.from({ length: 12 }, (_, i) => i + 1);

    const monthlyData = await Promise.all(
      monthsToProcess.map(async (currentMonth) => {
        const startDate = new Date(year, currentMonth - 1, 1);
        const endDate = new Date(year, currentMonth, 0);

        const playHistory = await prisma.playHistory.findMany({
          where: {
            created_at: {
              gte: startDate,
              lt: endDate,
            },
          },
          select: {
            genre_id: true,
            genre: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const genreCounts = playHistory.reduce((acc, play) => {
          const genreId = String(play.genre?.id || 0);
          const genreName = play.genre?.name || "Unknown";

          if (!acc[genreId]) {
            acc[genreId] = {
              id: genreId,
              name: genreName,
              count: 0,
            };
          }
          acc[genreId].count++;
          return acc;
        }, {} as Record<string, TopItemAnalyticsResponse>);

        return Object.values(genreCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      })
    );

    return {
      labels: type === "monthly" ? monthsToProcess : MONTH_LABELS,
      data: monthlyData,
    };
  }

  public async getTopAlbumsAnalytics(
    params: AnalyticsParams
  ): Promise<AnalyticsResponse> {
    const { date, type = "monthly" } = params;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (type === "monthly" && !month) {
      throw new BadRequestException("Month is required for monthly analytics");
    }

    const periodLength = type === "monthly" ? 1 : 12;
    const monthsToProcess =
      type === "monthly"
        ? [month]
        : Array.from({ length: 12 }, (_, i) => i + 1);

    const monthlyData = await Promise.all(
      monthsToProcess.map(async (currentMonth) => {
        const startDate = new Date(year, currentMonth - 1, 1);
        const endDate = new Date(year, currentMonth, 0);

        const playHistory = await prisma.playHistory.findMany({
          where: {
            created_at: {
              gte: startDate,
              lt: endDate,
            },
          },
          select: {
            album_id: true,
            album: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const albumCounts = playHistory.reduce((acc, play) => {
          const albumId = String(play.album?.id || 0);
          const albumName = play.album?.name || "Unknown";

          if (!acc[albumId]) {
            acc[albumId] = {
              id: albumId,
              name: albumName,
              count: 0,
            };
          }
          acc[albumId].count++;
          return acc;
        }, {} as Record<string, TopItemAnalyticsResponse>);

        return Object.values(albumCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      })
    );

    return {
      labels: type === "monthly" ? monthsToProcess : MONTH_LABELS,
      data: monthlyData,
    };
  }

  public async getMonthlyTotalAnalytics(): Promise<MonthlyTotalAnalyticsResponse> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalPlayCount, totalPurchaseAmount] = await Promise.all([
      prisma.playHistory.count({
        where: {
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.purchase.aggregate({
        where: {
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: "APPROVED",
        },
        _sum: {
          price: true,
        },
      }),
    ]);

    return {
      totalPlayCount,
      totalPurchaseAmount: totalPurchaseAmount._sum.price || 0,
    };
  }
}

export default new AnalysisService();
