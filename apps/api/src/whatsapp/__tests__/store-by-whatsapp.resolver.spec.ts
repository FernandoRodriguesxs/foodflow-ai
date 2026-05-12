import { NotFoundException } from "@nestjs/common";
import { StoreByWhatsAppResolver } from "../store-by-whatsapp.resolver";
import { WhatsAppNumber } from "../value-objects/whatsapp-number";
import { FAKE_STORE_ID, FAKE_STORE_WHATSAPP } from "./fixtures";

describe("StoreByWhatsAppResolver", () => {
  const mockLimit = jest.fn();
  const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
  const mockDatabase = { select: mockSelect } as any;

  const resolver = new StoreByWhatsAppResolver(mockDatabase);
  const number = WhatsAppNumber.create(FAKE_STORE_WHATSAPP);

  afterEach(() => jest.clearAllMocks());

  it("should return a StoreId when a matching store exists", async () => {
    mockLimit.mockResolvedValueOnce([{ id: FAKE_STORE_ID }]);

    const result = await resolver.resolveStoreId(number);

    expect(result.value).toBe(FAKE_STORE_ID);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it("should throw NotFoundException when no store matches the WhatsApp number", async () => {
    mockLimit.mockResolvedValueOnce([]);

    await expect(resolver.resolveStoreId(number)).rejects.toThrow(NotFoundException);
  });
});
