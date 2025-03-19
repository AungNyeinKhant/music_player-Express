export type UserRegisterDto = {
  username?: string;
  email: string;
  password: string;
};

export type UserLoginDto = {
  email: string;
  password: string;
};
