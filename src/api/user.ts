// POST /api/user/info
export interface MV4UserInfo {
  username: string;
  email: string;
  permission: MV4UserPermissionLevel;
  balance: number;
  fbCoins: number;
  plan: MV4UserProductType;
  planExpire: number;
  isLifetimePlan: boolean;
}

export enum MV4UserPermissionLevel {
  USER,
  DEALER, // 授权经销商
  ADMIN,
  OWNER,
}

export enum MV4UserProductType {
  NO_SERVICES,
  PREMIUM,
  BUSINESS,
  COMMERCIAL,
  DEVELOPER,
}
