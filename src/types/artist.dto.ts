export type ArtistRegisterDto = {
  name: string;
  email: string;
  phone: string; // Assuming phoneNumberSchema resolves to string
  password: string;
  image?: Express.Multer.File | undefined;
  bg_image?: Express.Multer.File | undefined;
  dob: Date;
  nrc_front: Express.Multer.File;
  nrc_back?: Express.Multer.File | undefined;
};
