import { z } from "zod";

export const createAlbumSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255),
  artist_id: z.string().trim().min(1).max(255),
  genre_id: z.string().trim().min(1).max(255),
});

export const createPackageSchema = z.object({});

export const createPlaylistSchema = z.object({});
