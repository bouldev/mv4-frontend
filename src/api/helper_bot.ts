// POST /api/helper-bot/base_info
export interface HelperBotInfo {
  nick: string;
  uid: number;
  login_type: HelperBotLoginType;
}

export type HelperBotLoginType = 'netease' | '4399';

// POST /api/helper-bot/daily-signing
export interface HelperBotDailySigningResp {
  xp: number;
}
