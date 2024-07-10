export interface MV4ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class MV4RequestError extends Error {
  readonly response?: MV4ApiResponse<any> | null;

  constructor(message: string, response?: any) {
    super(message);
    this.message = message;
    if (response !== undefined) {
      this.response = response;
    } else {
      this.response = null;
    }
  }
}
