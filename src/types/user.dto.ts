export type UserRegisterDto = {
  username?: string;
  email: string;
  password: string;
};

export type UserRegisterResponseDto = {
  email: string;
  username: string;
};
