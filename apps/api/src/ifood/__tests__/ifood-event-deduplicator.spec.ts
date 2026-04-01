import { IFoodEventDeduplicator } from "@ifood/ifood-event-deduplicator";
import { createFakePollingPayloads } from "./fixtures";

describe("IFoodEventDeduplicator", () => {
  const mockWhere = jest.fn();
  const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
  const mockDatabase = { select: mockSelect } as any;

  const deduplicator = new IFoodEventDeduplicator(mockDatabase);

  afterEach(() => jest.clearAllMocks());

  it("should return all events when none exist in database", async () => {
    const events = createFakePollingPayloads(3);
    mockWhere.mockResolvedValueOnce([]);

    const result = await deduplicator.filterNewEvents(events);

    expect(result).toHaveLength(3);
  });

  it("should filter out events that already exist", async () => {
    const events = createFakePollingPayloads(3);
    mockWhere.mockResolvedValueOnce([{ eventId: "polling-event-0" }, { eventId: "polling-event-2" }]);

    const result = await deduplicator.filterNewEvents(events);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("polling-event-1");
  });

  it("should return empty array when all events exist", async () => {
    const events = createFakePollingPayloads(2);
    mockWhere.mockResolvedValueOnce([{ eventId: "polling-event-0" }, { eventId: "polling-event-1" }]);

    const result = await deduplicator.filterNewEvents(events);

    expect(result).toHaveLength(0);
  });

  it("should return empty array for empty input", async () => {
    const result = await deduplicator.filterNewEvents([]);

    expect(result).toHaveLength(0);
    expect(mockSelect).not.toHaveBeenCalled();
  });
});
