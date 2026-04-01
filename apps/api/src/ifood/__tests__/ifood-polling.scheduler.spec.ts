import { IFoodPollingScheduler } from "@ifood/ifood-polling.scheduler";
import { IFOOD_POLLING_JOB, IFOOD_POLLING_INTERVAL_MS } from "@ifood/ifood.constants";

describe("IFoodPollingScheduler", () => {
  const mockQueue = { add: jest.fn().mockResolvedValue(undefined) } as any;

  const scheduler = new IFoodPollingScheduler(mockQueue);

  afterEach(() => jest.clearAllMocks());

  it("should register repeatable job on module init", async () => {
    await scheduler.onModuleInit();

    expect(mockQueue.add).toHaveBeenCalledWith(
      IFOOD_POLLING_JOB,
      {},
      { repeat: { every: IFOOD_POLLING_INTERVAL_MS } },
    );
  });
});
