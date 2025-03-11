export type ResponseFormatter<T> = {
  success: boolean;
  message: string;
  data?: T[] | any;
};
