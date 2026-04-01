export const STORE_ROOM_PREFIX = "store:";

export const DASHBOARD_EVENTS = {
  TEST: "test_connection",
} as const;

export function buildStoreRoom(storeId: string): string {
  return `${STORE_ROOM_PREFIX}${storeId}`;
}
