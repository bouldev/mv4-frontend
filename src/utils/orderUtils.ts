import { MV4OrderStatusEnum } from '@/api/order';

export function getOrderStatusEmoji(status: MV4OrderStatusEnum) {
  switch (status) {
    case MV4OrderStatusEnum.WAITING_TO_PAY:
      return '🟡'; // 待支付
    case MV4OrderStatusEnum.ORDER_PAID_SUCCESS:
      return '🟢'; // 已支付
    case MV4OrderStatusEnum.ORDER_ERROR:
      return '🔴'; // 订单异常
    case MV4OrderStatusEnum.ORDER_CANCELED:
      return '❌'; // 订单被取消
    case MV4OrderStatusEnum.PROCESSING:
      return '🕓'; // 订单处理中
    default:
      return '❓'; // 订单情况未知
  }
}
