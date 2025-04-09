import { PrismaClient } from "@prisma/client";
import { config } from "../config/app.config";
import { BadRequestException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";

const prisma = new PrismaClient();

class PlaylistService {
  async createPlaylist(name: string, user_id: string) {
    try {
      const playlist = await prisma.playlist.create({
        data: {
          name,
          user_id,
        },
      });
      return playlist;
    } catch (error) {
      throw error;
    }
  }

  async getPlaylistsByUserId(user_id: string) {
    try {
      const playlists = await prisma.playlist.findMany({
        where: {
          user_id,
        },
        include: {
          playlist_tracks: {
            include: {
              track: {
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
              },
            },
          },
        },
      });

      const processedPlaylists = playlists.map((playlist) => ({
        ...playlist,
        playlist_tracks: playlist.playlist_tracks.map((pt) => ({
          ...pt,
          track: {
            ...pt.track,
            audio: pt.track.audio
              ? `${config.BACKEND_BASE_URL}/uploads/track/${pt.track.audio}`
              : null,
            artist: pt.track.artist
              ? {
                  ...pt.track.artist,
                  image: pt.track.artist.image
                    ? `${config.BACKEND_BASE_URL}/uploads/artist/${pt.track.artist.image}`
                    : null,
                }
              : null,
            album: pt.track.album
              ? {
                  ...pt.track.album,
                  image: pt.track.album.image
                    ? `${config.BACKEND_BASE_URL}/uploads/album/${pt.track.album.image}`
                    : null,
                }
              : null,
          },
        })),
      }));

      return processedPlaylists;
    } catch (error) {
      throw error;
    }
  }

  async handleTrackToPlaylist(playlist_id: string, track_id: string) {
    try {
      const existingTrack = await prisma.playlistTrack.findFirst({
        where: {
          playlist_id,
          track_id,
        },
      });

      if (existingTrack) {
        await prisma.playlistTrack.delete({
          where: {
            id: existingTrack.id,
          },
        });
        return { message: "Track removed from playlist" };
      }

      const playlistTrack = await prisma.playlistTrack.create({
        data: {
          playlist_id,
          track_id,
        },
        include: {
          track: true,
          playlist: true,
        },
      });
      return { message: "Track added to playlist" };
    } catch (error) {
      throw error;
    }
  }

  async updatePlaylist(id: string, name: string, user_id: string) {
    try {
      const playlist = await prisma.playlist.findUnique({
        where: { id },
      });

      if (!playlist) {
        throw new BadRequestException(
          "Playlist not found",
          ErrorCode.RESOURCE_NOT_FOUND
        );
      }

      if (playlist.user_id !== user_id) {
        throw new BadRequestException(
          "You don't have permission to update this playlist",
          ErrorCode.ACCESS_FORBIDDEN
        );
      }

      const updatedPlaylist = await prisma.playlist.update({
        where: { id },
        data: { name },
        include: {
          playlist_tracks: {
            include: {
              track: {
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
              },
            },
          },
        },
      });

      const processedPlaylist = {
        ...updatedPlaylist,
        playlist_tracks: updatedPlaylist.playlist_tracks.map((pt) => ({
          ...pt,
          track: {
            ...pt.track,
            audio: pt.track.audio
              ? `${config.BACKEND_BASE_URL}/uploads/track/${pt.track.audio}`
              : null,
            artist: pt.track.artist
              ? {
                  ...pt.track.artist,
                  image: pt.track.artist.image
                    ? `${config.BACKEND_BASE_URL}/uploads/artist/${pt.track.artist.image}`
                    : null,
                }
              : null,
            album: pt.track.album
              ? {
                  ...pt.track.album,
                  image: pt.track.album.image
                    ? `${config.BACKEND_BASE_URL}/uploads/album/${pt.track.album.image}`
                    : null,
                }
              : null,
          },
        })),
      };

      return processedPlaylist;
    } catch (error) {
      throw error;
    }
  }

  async deletePlaylist(id: string, user_id: string) {
    try {
      const playlist = await prisma.playlist.findUnique({
        where: { id },
      });

      if (!playlist) {
        throw new BadRequestException(
          "Playlist not found",
          ErrorCode.RESOURCE_NOT_FOUND
        );
      }

      if (playlist.user_id !== user_id) {
        throw new BadRequestException(
          "You don't have permission to delete this playlist",
          ErrorCode.ACCESS_FORBIDDEN
        );
      }

      // Delete all playlist tracks first
      await prisma.playlistTrack.deleteMany({
        where: { playlist_id: id },
      });

      // Then delete the playlist
      await prisma.playlist.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new PlaylistService();
