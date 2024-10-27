import {
  MV4UserInfo,
  MV4UserPermissionLevel,
  MV4UserProductType,
} from '@/api/user';
import { formatTime, nowUnix } from '@/utils/timeUtils';

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
      return '无（未购买）';
    case MV4UserProductType.PREMIUM:
      return 'Premium';
    case MV4UserProductType.BUSINESS:
      return 'Business';
    case MV4UserProductType.COMMERCIAL:
      return 'Commercial';
    case MV4UserProductType.DEVELOPER:
      return 'Developer';
    default:
      return 'unknown';
  }
}

export function productExpireDateToString(userInfo: MV4UserInfo) {
  if (userInfo.isLifetimePlan) {
    return '无限制';
  }
  if (userInfo.planExpire === 0) {
    return '从未购买过任何订阅计划';
  }
  const expireDateString = formatTime(userInfo.planExpire, true);
  if (userInfo.planExpire < nowUnix()) {
    return `已过期，过期于 ${expireDateString}`;
  }
  return expireDateString;
}
