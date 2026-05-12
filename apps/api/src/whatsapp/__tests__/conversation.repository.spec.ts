import { ConversationRepository } from "../conversation.repository";
import { WhatsAppNumber } from "../value-objects/whatsapp-number";
import type { TenantDatabaseService } from "@tenant/tenant-database.service";
import {
  FAKE_CONVERSATION_ID,
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_ID,
  FAKE_STORE_ID_VO,
  createFakeMessageRecord,
} from "./fixtures";

describe("ConversationRepository", () => {
  const mockSelectLimit = jest.fn();
  const mockSelectWhere = jest.fn().mockReturnValue({ limit: mockSelectLimit });
  const mockSelectFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
  const mockSelect = jest.fn().mockReturnValue({ from: mockSelectFrom });

  const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
  const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

  const mockInsertReturning = jest.fn();
  const mockInsertValues = jest.fn().mockReturnValue({ returning: mockInsertReturning });
  const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });

  const mockDb = { select: mockSelect, update: mockUpdate, insert: mockInsert };

  const mockTenantDatabase: jest.Mocked<TenantDatabaseService> = {
    executeWithTenant: jest.fn().mockImplementation((_storeId, operation) => operation(mockDb)),
  } as any;

  const repository = new ConversationRepository(mockTenantDatabase);
  const sender = WhatsAppNumber.create(FAKE_SENDER_WHATSAPP);

  afterEach(() => jest.clearAllMocks());

  it("should append message to existing active conversation", async () => {
    mockSelectLimit.mockResolvedValueOnce([{ id: FAKE_CONVERSATION_ID }]);
    const record = createFakeMessageRecord();

    const result = await repository.appendIncomingMessage(FAKE_STORE_ID_VO, sender, record);

    expect(result).toBe(FAKE_CONVERSATION_ID);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(FAKE_STORE_ID, expect.any(Function));
  });

  it("should create new conversation when none exists", async () => {
    mockSelectLimit.mockResolvedValueOnce([]);
    mockInsertReturning.mockResolvedValueOnce([{ id: "new-conversation-id" }]);
    const record = createFakeMessageRecord();

    const result = await repository.appendIncomingMessage(FAKE_STORE_ID_VO, sender, record);

    expect(result).toBe("new-conversation-id");
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsertValues).toHaveBeenCalledWith({
      storeId: FAKE_STORE_ID,
      whatsappNumber: FAKE_SENDER_WHATSAPP,
      messages: [record],
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should propagate errors from the tenant database", async () => {
    mockTenantDatabase.executeWithTenant.mockRejectedValueOnce(new Error("db fail"));

    await expect(
      repository.appendIncomingMessage(FAKE_STORE_ID_VO, sender, createFakeMessageRecord()),
    ).rejects.toThrow("db fail");
  });
});
