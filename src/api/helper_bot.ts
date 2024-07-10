// POST /api/helper-bot/info
export interface HelperBotInfo {
  status: HelperBotStatus;
  nick: string;
  dailySigned: boolean;
}

// POST /api/helper-bot/daily-signing
export interface HelperBotDailySigningResp {
  xp: number;
}

export enum HelperBotStatus {
  NEED_INIT,
  NEED_LOGIN_ACCOUNT,
  NEED_REALNAME,
  NEED_SET_NICKNAME,
  OK,
}
