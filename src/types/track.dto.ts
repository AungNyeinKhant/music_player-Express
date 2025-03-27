export type TrackDto = {
  name: string;
  description?: string;
  audio: Express.Multer.File;
  artist_id: string;
  album_id: string;
  genre_id: string;
};

export type PlayTrackDto = {
  user_id: string;
  track_id: string;
  album_id: string;
  genre_id: string;
};

export type TrendingTracksDto = {
  limit: string;
  offset: string;
};
