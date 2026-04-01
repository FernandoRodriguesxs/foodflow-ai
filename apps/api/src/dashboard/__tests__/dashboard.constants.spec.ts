import { buildStoreRoom, STORE_ROOM_PREFIX } from "@dashboard/dashboard.constants";

describe("buildStoreRoom", () => {
  it("should build room name with store prefix and id", () => {
    const storeId = "abc-123";

    const room = buildStoreRoom(storeId);

    expect(room).toBe(`${STORE_ROOM_PREFIX}${storeId}`);
  });
});
