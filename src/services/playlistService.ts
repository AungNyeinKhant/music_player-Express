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
}

export default new PlaylistService();
