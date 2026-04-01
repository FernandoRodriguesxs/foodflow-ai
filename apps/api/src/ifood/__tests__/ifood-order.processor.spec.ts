import { IFoodOrderProcessor } from "@ifood/ifood-order.processor";
import type { IFoodOrderClient } from "@ifood/ifood-order-client";
import type { IFoodEventRepository } from "@ifood/ifood-event.repository";
import {
  FAKE_STORE_ID,
  FAKE_EVENT_ID,
  createFakeIFoodOrderDetails,
  createFakeProcessJobData,
} from "./fixtures";

describe("IFoodOrderProcessor", () => {
  const mockOrderClient = {
    fetchOrderDetails: jest.fn(),
  } as unknown as jest.Mocked<IFoodOrderClient>;

  const mockEventRepository = {
    markAsProcessed: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodEventRepository>;

  const processor = new IFoodOrderProcessor(mockOrderClient, mockEventRepository);

  afterEach(() => jest.clearAllMocks());

  it("should fetch order details for PLACED events", async () => {
    const jobData = createFakeProcessJobData();
    mockOrderClient.fetchOrderDetails.mockResolvedValueOnce(createFakeIFoodOrderDetails());

    await processor.process({ data: jobData } as any);

    expect(mockOrderClient.fetchOrderDetails).toHaveBeenCalledTimes(1);
  });

  it("should mark event as processed after fetching order details", async () => {
    const jobData = createFakeProcessJobData();
    mockOrderClient.fetchOrderDetails.mockResolvedValueOnce(createFakeIFoodOrderDetails());

    await processor.process({ data: jobData } as any);

    expect(mockEventRepository.markAsProcessed).toHaveBeenCalledWith(
      expect.objectContaining({ value: FAKE_STORE_ID }),
      expect.objectContaining({ value: FAKE_EVENT_ID }),
    );
  });

  it("should skip non-PLACED events", async () => {
    const jobData = createFakeProcessJobData({ eventType: "CONFIRMED" });

    await processor.process({ data: jobData } as any);

    expect(mockOrderClient.fetchOrderDetails).not.toHaveBeenCalled();
    expect(mockEventRepository.markAsProcessed).not.toHaveBeenCalled();
  });

  it("should propagate errors from order client", async () => {
    const jobData = createFakeProcessJobData();
    mockOrderClient.fetchOrderDetails.mockRejectedValueOnce(new Error("network error"));

    await expect(processor.process({ data: jobData } as any)).rejects.toThrow("network error");
  });
});
