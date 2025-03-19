export type TrackDto = {
  name: string;
  description?: string;
  audio: Express.Multer.File;
  artist_id: string;
  album_id: string;
  genre_id: string;
};
