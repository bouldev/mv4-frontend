import axios from 'axios';
import { MV4RequestError } from '@/api/base';

export interface SimplePlayerInfo {
  entity_id: string;
  name: string;
  avatar_image_url: string;
}

export interface SimpleResponseNEMC {
  code: number;
  message: string;
  entity: any;
}

export async function nemcQueryPlayer(
  playerName: string,
): Promise<SimplePlayerInfo> {
  const ret: SimpleResponseNEMC = (
    await axios({
      method: 'POST',
      url: 'https://g79mclobt.minecraft.cn/user/query/search-by-name',
      data: {
        name: playerName,
      },
    })
  ).data;
  if (ret.code !== 0) {
    throw new MV4RequestError(ret.message);
  }
  return ret.entity;
}
