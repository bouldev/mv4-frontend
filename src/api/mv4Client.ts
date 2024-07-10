import axios from 'axios';
import { MV4ApiResponse, MV4RequestError } from '@/api/base';

export const API_BASE_PATH = '/api';

export interface MV4RequestApiConfig<T> {
  path: string;
  methodGet?: boolean;
  data?: T;
}

export async function mv4RequestApi<Request, Response>(
  conf: MV4RequestApiConfig<Request>,
): Promise<MV4ApiResponse<Response>> {
  const ret: MV4ApiResponse<Response> = (
    await axios({
      method: conf.methodGet ? 'GET' : 'POST',
      url: `${API_BASE_PATH}${conf.path}`,
      data: conf.data !== undefined ? conf.data : '',
    })
  ).data;
  if (!ret.success) {
    throw new MV4RequestError(ret.message);
  }
  return ret;
}
