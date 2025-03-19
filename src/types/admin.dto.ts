export type AdminRegisterDto = {
  name: string;
  email: string;
  password: string;
  image?: Express.Multer.File | undefined;
  staff_id: string;
};

export type AdminLoginDto = {
  email: string;
  password: string;
};
