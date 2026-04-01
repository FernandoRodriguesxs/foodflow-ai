import { IFoodEventRepository } from "../ifood-event.repository";
import { IFoodEventId } from "../value-objects/ifood-event-id";
import type { TenantDatabaseService } from "@tenant/tenant-database.service";
import { createFakeWebhookEvent, FAKE_STORE_ID, FAKE_STORE_ID_VO } from "./fixtures";

describe("IFoodEventRepository", () => {
  const mockWhere = jest.fn().mockResolvedValue(undefined);
  const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
  const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
  const mockInsertValues = jest.fn().mockResolvedValue(undefined);
  const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });

  const mockTenantDatabase: jest.Mocked<TenantDatabaseService> = {
    executeWithTenant: jest.fn().mockImplementation((_storeId, operation) =>
      operation({ insert: mockInsert, update: mockUpdate }),
    ),
  } as any;

  const repository = new IFoodEventRepository(mockTenantDatabase);

  afterEach(() => jest.clearAllMocks());

  it("should execute insert within tenant context", async () => {
    const event = createFakeWebhookEvent();

    await repository.saveEvent(FAKE_STORE_ID_VO, event);

    expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(
      FAKE_STORE_ID,
      expect.any(Function),
    );
  });

  it("should insert with correct values extracted from Value Objects", async () => {
    const event = createFakeWebhookEvent();

    await repository.saveEvent(FAKE_STORE_ID_VO, event);

    expect(mockInsertValues).toHaveBeenCalledWith({
      storeId: FAKE_STORE_ID,
      eventId: event.eventId.value,
      eventType: event.eventType,
      payload: event.payload,
    });
  });

  it("should propagate errors from tenant database", async () => {
    mockTenantDatabase.executeWithTenant.mockRejectedValueOnce(new Error("db fail"));

    await expect(
      repository.saveEvent(FAKE_STORE_ID_VO, createFakeWebhookEvent()),
    ).rejects.toThrow("db fail");
  });

  it("should mark events as acknowledged within tenant context", async () => {
    const eventIds = [IFoodEventId.create("event-1"), IFoodEventId.create("event-2")];

    await repository.markAsAcknowledged(FAKE_STORE_ID_VO, eventIds);

    expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(
      FAKE_STORE_ID,
      expect.any(Function),
    );
    expect(mockSet).toHaveBeenCalledWith({ acknowledged: true });
  });

  it("should skip update when event list is empty", async () => {
    await repository.markAsAcknowledged(FAKE_STORE_ID_VO, []);

    expect(mockTenantDatabase.executeWithTenant).not.toHaveBeenCalled();
  });
});
