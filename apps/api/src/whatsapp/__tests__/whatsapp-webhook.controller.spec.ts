import { WhatsAppWebhookController } from "../whatsapp-webhook.controller";
import type { ConversationService } from "../conversation.service";
import {
  FAKE_CONVERSATION_ID,
  FAKE_MESSAGE_TEXT,
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_WHATSAPP,
  createFakeWebhookPayload,
} from "./fixtures";

describe("WhatsAppWebhookController", () => {
  const mockService = {
    persistIncomingMessage: jest.fn().mockResolvedValue(FAKE_CONVERSATION_ID),
  } as unknown as jest.Mocked<ConversationService>;

  const controller = new WhatsAppWebhookController(mockService);

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

  it("should propagate errors from the service", async () => {
    mockService.persistIncomingMessage.mockRejectedValueOnce(new Error("fail"));

    await expect(controller.receiveMessage(createFakeWebhookPayload())).rejects.toThrow("fail");
  });
});
