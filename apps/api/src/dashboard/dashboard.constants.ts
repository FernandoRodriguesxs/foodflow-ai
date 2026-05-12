export const STORE_ROOM_PREFIX = "store:";

export const DASHBOARD_EVENTS = {
  TEST: "test_connection",
  NEW_ORDER: "new_order",
  ORDER_STATUS_UPDATED: "order_status_updated",
} as const;

export function buildStoreRoom(storeId: string): string {
  return `${STORE_ROOM_PREFIX}${storeId}`;
}
