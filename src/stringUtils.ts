import {
  MV4UserInfo,
  MV4UserPermissionLevel,
  MV4UserProductType,
} from '@/api/user';
import { formatTime, nowUnix } from '@/timeUtils';

export function permissionToString(level: MV4UserPermissionLevel) {
  switch (level) {
    case MV4UserPermissionLevel.USER:
      return '用户';
    case MV4UserPermissionLevel.DEALER:
      return '授权经销商';
    case MV4UserPermissionLevel.ADMIN:
      return '管理员';
    case MV4UserPermissionLevel.OWNER:
      return '所有者';
    default:
      return '未知';
  }
}

export function productTypeToString(productType: MV4UserProductType) {
  switch (productType) {
    case MV4UserProductType.NO_SERVICES:
      return '无';
    case MV4UserProductType.PREMIUM:
      return 'FastBuilder Premium';
    case MV4UserProductType.BUSINESS:
      return 'FastBuilder Business';
    case MV4UserProductType.COMMERCIAL:
      return 'FastBuilder Commercial';
    case MV4UserProductType.DEVELOPER:
      return 'FastBuilder Developer';
    default:
      return 'unknown';
  }
}

export function productExpireDateToString(userInfo: MV4UserInfo) {
  if (userInfo.isLifetimePlan) {
    return '无限制';
  }
  if (userInfo.planExpire === 0) {
    return '已过期';
  }
  const expireDateString = formatTime(userInfo.planExpire, true);
  if (userInfo.planExpire < nowUnix()) {
    return `已过期，过期于 ${expireDateString}`;
  }
  return expireDateString;
}
