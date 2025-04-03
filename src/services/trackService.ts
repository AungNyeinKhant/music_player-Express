import { config } from "../config/app.config";
import { ErrorCode } from "../enums/error-code.enum";
import prisma from "../prisma";
import { PlayTrackDto, TrackDto, TrendingTracksDto } from "../types/track.dto";
import {
  BadRequestException,
  InternalServerException,
} from "../utils/catch-errors";
import { logger } from "../utils/logger";

class TrackService {
  public async getTracksByAlbumId(album_id: string) {
    const tracks = await prisma.track.findMany({
      where: { album_id },
      include: {
        artist: {
          select: {
            name: true,
            image: true,
          },
        },
        genre: {
          select: {
            name: true,
          },
        },
        album: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    const processedTracks = tracks.map((track) => ({
      ...track,
      audio: track.audio
        ? `${config.BACKEND_BASE_URL}/uploads/track/${track.audio}`
        : null,
      artist: track.artist
        ? {
            ...track.artist,
            image: track.artist.image
              ? `${config.BACKEND_BASE_URL}/uploads/artist/${track.artist.image}`
              : null,
          }
        : null,
      album: track.album
        ? {
            ...track.album,
            image: track.album.image
              ? `${config.BACKEND_BASE_URL}/uploads/album/${track.album.image}`
              : null,
          }
        : null,
    }));

    return processedTracks;
  }

  public async createTrack(createTrackData: TrackDto) {
    const { name, description, audio, artist_id, album_id, genre_id } =
      createTrackData;

    const newTrack = await prisma.track.create({
      data: {
        name,
        description,
        audio: audio?.filename,
        artist_id,
        album_id,
        genre_id,
      },
    });

    return newTrack;
  }

  public async playTrack(data: PlayTrackDto) {
    const { user_id, track_id } = data;

    const play = await prisma.$transaction(async (prisma) => {
      const currentTrack = await prisma.track.findUnique({
        where: { id: track_id },
        // select: { listen_count: true },
      });

      if (!currentTrack) {
        logger.error(`Track not found and Internal Error trackId ${track_id}`);
        throw new BadRequestException(
          "Track not found and Internal Error",
          ErrorCode.INTERNAL_SERVER_ERROR
        );
      }

      const updatedTrack = await prisma.track.update({
        where: { id: track_id },
        data: { listen_count: currentTrack.listen_count + 1 },
        include: {
          artist: {
            select: {
              name: true,
              image: true,
            },
          },
          genre: {
            select: {
              name: true,
            },
          },
          album: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      const playHistory = await prisma.playHistory.create({
        data: {
          user_id,
          track_id,
          album_id: updatedTrack.album_id,
          genre_id: updatedTrack.genre_id,
        },
      });
      // Add more Prisma client operations here

      return {
        ...updatedTrack,
        audio: updatedTrack.audio
          ? `${config.BACKEND_BASE_URL}/uploads/track/${updatedTrack.audio}`
          : null,
        artist: updatedTrack.artist
          ? {
              ...updatedTrack.artist,
              image: updatedTrack.artist.image
                ? `${config.BACKEND_BASE_URL}/uploads/artist/${updatedTrack.artist.image}`
                : null,
            }
          : null,
        album: updatedTrack.album
          ? {
              ...updatedTrack.album,
              image: updatedTrack.album.image
                ? `${config.BACKEND_BASE_URL}/uploads/album/${updatedTrack.album.image}`
                : null,
            }
          : null,
      };
    });

    return play;
  }

  public async getTrendingTracks(data: TrendingTracksDto) {
    const { limit, offset } = data;
    const startTrendDate = new Date();
    startTrendDate.setDate(
      startTrendDate.getDate() - parseInt(config.TRENDING_TRACK_WITHIN)
    );

    const skip = (parseInt(offset) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const trendingTracks = await prisma.track.findMany({
      where: {
        created_at: {
          gte: startTrendDate,
        },
      },
      orderBy: {
        listen_count: "desc",
      },
      skip: skip,
      take: take,
    });

    const totalCount = await prisma.track.count({
      where: {
        created_at: {
          gte: startTrendDate,
        },
      },
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const currentPage = offset;

    return {
      trendingTracks,
      totalCount,
      totalPages,
      currentPage,
    };
  }

  public async getMostListenTrack(data: { limit: any }) {
    const { limit } = data;
    const startCountDate = new Date();
    startCountDate.setDate(
      startCountDate.getDate() - parseInt(config.MOST_LISTEN_TRACK_WITHIN)
    );

    const take = parseInt(limit);

    //most played tracks
    const mostListenTracks = await prisma.playHistory.groupBy({
      by: ["track_id"],
      where: {
        created_at: {
          gte: startCountDate,
        },
      },
      _count: {
        track_id: true,
      },
      orderBy: {
        _count: {
          track_id: "desc",
        },
      },
      take: take,
    });
    //add tracks details
    let mostListenTracksDetail = [];
    for (let i = 0; i < mostListenTracks.length; i++) {
      let track = mostListenTracks[i];
      let trackDetail = await prisma.track.findUnique({
        where: { id: track.track_id },
      });
      let album = await prisma.album.findUnique({
        where: { id: trackDetail?.album_id },
      });
      if (!trackDetail) {
        throw new InternalServerException();
      }
      mostListenTracksDetail.push({
        ...trackDetail,
        image: album?.image
          ? `${config.BACKEND_BASE_URL}/uploads/album/${album?.image}`
          : null,
        audio: `${config.BACKEND_BASE_URL}/uploads/track/${trackDetail.audio}`,
        count: track._count.track_id,
      });
    }

    return mostListenTracksDetail;
  }

  public async getRecentTracks(data: { limit: any; userId: string }) {
    const { limit, userId } = data;
    const recentTrackWithUser = await prisma.playHistory.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: parseInt(limit),
      distinct: ["track_id"],
    });

    const trackIds = recentTrackWithUser.map((track) => track.track_id);

    const tracksDetail = await prisma.track.findMany({
      where: {
        id: {
          in: trackIds,
        },
      },
      include: {
        artist: {
          select: {
            name: true,
            image: true,
          },
        },
        genre: {
          select: {
            name: true,
          },
        },
        album: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    const processedTracks = tracksDetail.map((track) => ({
      ...track,
      audio: track.audio
        ? `${config.BACKEND_BASE_URL}/uploads/track/${track.audio}`
        : null,
      artist: track.artist
        ? {
            ...track.artist,
            image: track.artist.image
              ? `${config.BACKEND_BASE_URL}/uploads/artist/${track.artist.image}`
              : null,
          }
        : null,
      album: track.album
        ? {
            ...track.album,
            image: track.album.image
              ? `${config.BACKEND_BASE_URL}/uploads/album/${track.album.image}`
              : null,
          }
        : null,
    }));

    return processedTracks;
  }
}
const trackService = new TrackService();
export default trackService;
