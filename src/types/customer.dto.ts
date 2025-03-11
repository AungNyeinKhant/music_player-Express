export type CustomerRegisterDto = {
  username?: string;
  email: string;
  password: string;
};

export type CustomerRegisterResponseDto = {
  email: string;
  username: string;
};
