export enum MV4OrderStatusEnum {
  /** 待支付 */
  WAITING_TO_PAY,
  /** 已支付 */
  ORDER_PAID_SUCCESS,
  /** 订单错误（异常） */
  ORDER_ERROR,
  /** 订单被取消 */
  ORDER_CANCELED,
  /** 处理中 */
  PROCESSING,
  /** 已退款 */
  REFUNDED,
}

export interface MV4Order {
  orderNo: string;
  username: string;
  buyForUsername: string;
  /** 订单价格 */
  price: number;
  /** 实际支付价格 */
  realPrice: number;
  usedBalance: number;
  usedFBCoins: number;
  productId?: string;
  /** 支付网关 */
  gateway: string;
  createTime: number;
  payTime: number;
  orderStatus: MV4OrderStatusEnum;
  name: string;
  desc: string;
  payUrl: string;
}
