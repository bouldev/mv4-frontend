// POST /api/user/info
export interface MV4UserInfo {
  name: string;
  bind_nickname: string;
  email: string;
  level: MV4UserPermissionLevel;
  register_time: number;
  product: {
    type: MV4UserProductType;
    expire: number;
  };
  balance: number;
}

export enum MV4UserPermissionLevel {
  BANNED,
  USER,
  ADMIN,
  OWNER,
}

export enum MV4UserProductType {
  CLASSIC,
  PREMIUM,
  BUSINESS,
  DEVELOPER,
}
