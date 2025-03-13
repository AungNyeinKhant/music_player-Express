export type ResponseFormatter<T> =
  | {
      success: boolean;
      message: string;
      data?: T[] | any;
    }
  | {
      success: boolean;
      message: string;
      error?: T[] | any;
    };
