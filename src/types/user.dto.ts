export type UserRegisterDto = {
  name: string;
  email: string;
  phone: string;
  password: string;
  image?: Express.Multer.File;
  dob: string;
  // valid_until: Date;
};

export type UserLoginDto = {
  email: string;
  password: string;
};
