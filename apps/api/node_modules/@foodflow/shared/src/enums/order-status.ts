export const ORDER_STATUS = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  DISPATCHED: "DISPATCHED",
  CONCLUDED: "CONCLUDED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
