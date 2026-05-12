import { ConversationService } from "../conversation.service";
import type { StoreByWhatsAppResolver } from "../store-by-whatsapp.resolver";
import type { ConversationRepository } from "../conversation.repository";
import {
  FAKE_CONVERSATION_ID,
  FAKE_MESSAGE_TEXT,
  FAKE_RECEIVED_AT,
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_ID_VO,
  createFakeIncomingMessage,
} from "./fixtures";

describe("ConversationService", () => {
  const mockResolver = {
    resolveStoreId: jest.fn().mockResolvedValue(FAKE_STORE_ID_VO),
  } as unknown as jest.Mocked<StoreByWhatsAppResolver>;

  const mockRepository = {
    appendIncomingMessage: jest.fn().mockResolvedValue(FAKE_CONVERSATION_ID),
  } as unknown as jest.Mocked<ConversationRepository>;

  const service = new ConversationService(mockResolver, mockRepository);

  afterEach(() => jest.clearAllMocks());

  it("should resolve store, persist message and return conversation id", async () => {
    const incoming = createFakeIncomingMessage();

    const result = await service.persistIncomingMessage(incoming);

    expect(result).toBe(FAKE_CONVERSATION_ID);
    expect(mockResolver.resolveStoreId).toHaveBeenCalledWith(incoming.storeWhatsApp);
  });

  it("should pass message record with content and ISO timestamp to repository", async () => {
    const incoming = createFakeIncomingMessage();

    await service.persistIncomingMessage(incoming);

    expect(mockRepository.appendIncomingMessage).toHaveBeenCalledWith(
      FAKE_STORE_ID_VO,
      incoming.senderWhatsApp,
      {
        from: FAKE_SENDER_WHATSAPP,
        content: FAKE_MESSAGE_TEXT,
        receivedAt: FAKE_RECEIVED_AT.toISOString(),
        direction: "inbound",
      },
    );
  });

  it("should not call repository when store resolution fails", async () => {
    mockResolver.resolveStoreId.mockRejectedValueOnce(new Error("not found"));

    await expect(service.persistIncomingMessage(createFakeIncomingMessage())).rejects.toThrow("not found");
    expect(mockRepository.appendIncomingMessage).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    mockRepository.appendIncomingMessage.mockRejectedValueOnce(new Error("db error"));

    await expect(service.persistIncomingMessage(createFakeIncomingMessage())).rejects.toThrow("db error");
  });
});
