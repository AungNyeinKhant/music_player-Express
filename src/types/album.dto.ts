export type AlbumDto = {
  name: string;
  description: string;
  image?: Express.Multer.File | undefined;
  bg_image?: Express.Multer.File | undefined;
  artist_id: string ;
  genre_id: string;
};
