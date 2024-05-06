export interface MV4ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
