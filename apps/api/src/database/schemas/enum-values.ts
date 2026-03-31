export const USER_ROLE_VALUES = ["owner", "operator"] as const;
export const DEFAULT_USER_ROLE = USER_ROLE_VALUES[1];

export const ORDER_SOURCE_VALUES = ["ifood", "whatsapp"] as const;

export const ORDER_STATUS_VALUES = [
  "PLACED",
  "CONFIRMED",
  "DISPATCHED",
  "CONCLUDED",
  "CANCELLED",
] as const;
export const DEFAULT_ORDER_STATUS = ORDER_STATUS_VALUES[0];
