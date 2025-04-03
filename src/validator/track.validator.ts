import { z } from "zod";

export const createTrackSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255).optional(),
  artist_id: z.string().trim().min(1).max(255),
  album_id: z.string().trim().min(1).max(255),
  genre_id: z.string().trim().min(1).max(255),
});

export const playTrackSchema = z.object({
  user_id: z.string().trim().min(1).max(255),
  track_id: z.string().trim().min(1).max(255),
});

export const limitOffsetSchema = z.object({
  limit: z.string().trim().min(1).max(255),
  offset: z.string().trim().min(1).max(255),
});
