import { WhatsAppWebhookController } from "../whatsapp-webhook.controller";
import type { ConversationService } from "../conversation.service";
import type { WhatsAppOrderProcessor } from "../whatsapp-order.processor";
import {
  FAKE_CONVERSATION_ID,
  FAKE_MESSAGE_TEXT,
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_ID_VO,
  FAKE_STORE_WHATSAPP,
  createFakeWebhookPayload,
} from "./fixtures";

describe("WhatsAppWebhookController", () => {
  const mockService = {
    persistIncomingMessage: jest.fn().mockResolvedValue({
      conversationId: FAKE_CONVERSATION_ID,
      storeId: FAKE_STORE_ID_VO,
    }),
  } as unknown as jest.Mocked<ConversationService>;

  const mockProcessor = {
    processIfOrder: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<WhatsAppOrderProcessor>;

  const controller = new WhatsAppWebhookController(mockService, mockProcessor);

  afterEach(() => jest.clearAllMocks());

  it("should delegate parsed incoming message to conversation service", async () => {
    const payload = createFakeWebhookPayload();

    await controller.receiveMessage(payload);

    expect(mockService.persistIncomingMessage).toHaveBeenCalledTimes(1);
    const received = mockService.persistIncomingMessage.mock.calls[0][0];
    expect(received.storeWhatsApp.value).toBe(FAKE_STORE_WHATSAPP);
    expect(received.senderWhatsApp.value).toBe(FAKE_SENDER_WHATSAPP);
    expect(received.content.value).toBe(FAKE_MESSAGE_TEXT);
  });

  it("should invoke order processor with persisted conversation context", async () => {
    await controller.receiveMessage(createFakeWebhookPayload());

    expect(mockProcessor.processIfOrder).toHaveBeenCalledTimes(1);
    const [storeId, conversationId, incoming] = mockProcessor.processIfOrder.mock.calls[0];
    expect(storeId).toBe(FAKE_STORE_ID_VO);
    expect(conversationId).toBe(FAKE_CONVERSATION_ID);
    expect(incoming.content.value).toBe(FAKE_MESSAGE_TEXT);
  });

  it("should not call the order processor when conversation persistence fails", async () => {
    mockService.persistIncomingMessage.mockRejectedValueOnce(new Error("fail"));

    await expect(controller.receiveMessage(createFakeWebhookPayload())).rejects.toThrow("fail");
    expect(mockProcessor.processIfOrder).not.toHaveBeenCalled();
  });

  it("should propagate errors from the order processor", async () => {
    mockProcessor.processIfOrder.mockRejectedValueOnce(new Error("nlp fail"));

    await expect(controller.receiveMessage(createFakeWebhookPayload())).rejects.toThrow("nlp fail");
  });
});
