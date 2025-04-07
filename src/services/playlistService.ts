import { PrismaClient } from "@prisma/client";

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
              track: true,
            },
          },
        },
      });
      return playlists;
    } catch (error) {
      throw error;
    }
  }

  async addTrackToPlaylist(playlist_id: string, track_id: string) {
    try {
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
      return playlistTrack;
    } catch (error) {
      throw error;
    }
  }
}

export default new PlaylistService();
