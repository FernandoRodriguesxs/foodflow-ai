export const ORDER_SOURCE = {
  IFOOD: "ifood",
  WHATSAPP: "whatsapp",
} as const;

export type OrderSource = (typeof ORDER_SOURCE)[keyof typeof ORDER_SOURCE];
