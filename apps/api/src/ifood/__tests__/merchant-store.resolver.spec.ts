import { NotFoundException } from "@nestjs/common";
import { MerchantStoreResolver } from "../merchant-store.resolver";
import { MerchantId } from "../value-objects/merchant-id";
import { FAKE_STORE_ID, FAKE_MERCHANT_ID } from "./fixtures";

describe("MerchantStoreResolver", () => {
  const mockLimit = jest.fn();
  const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
  const mockDatabase = { select: mockSelect } as any;

  const resolver = new MerchantStoreResolver(mockDatabase);
  const merchantId = MerchantId.create(FAKE_MERCHANT_ID);

  afterEach(() => jest.clearAllMocks());

  it("should return a StoreId when a matching store exists", async () => {
    mockLimit.mockResolvedValueOnce([{ id: FAKE_STORE_ID }]);

    const result = await resolver.resolveStoreId(merchantId);

    expect(result.value).toBe(FAKE_STORE_ID);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it("should throw NotFoundException when no store matches the merchant ID", async () => {
    mockLimit.mockResolvedValueOnce([]);

    await expect(resolver.resolveStoreId(merchantId)).rejects.toThrow(NotFoundException);
  });
});
