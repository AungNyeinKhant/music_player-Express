export type UserRegisterDto = {
  name: string;
  email: string;
  phone: string;
  password: string;
  image?: Express.Multer.File;
  dob: string;
  
} ;
export type UserUpdateDto = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  image?: Express.Multer.File;
  dob: string;
  
};

export type UserLoginDto = {
  email: string;
  password: string;
};
