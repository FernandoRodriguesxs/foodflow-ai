import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import {
  IFOOD_POLLING_QUEUE,
  IFOOD_POLLING_JOB,
  IFOOD_POLLING_INTERVAL_MS,
} from "./ifood.constants";

@Injectable()
export class IFoodPollingScheduler implements OnModuleInit {
  private readonly logger = new Logger(IFoodPollingScheduler.name);

  constructor(
    @InjectQueue(IFOOD_POLLING_QUEUE) private readonly pollingQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.pollingQueue.add(
      IFOOD_POLLING_JOB,
      {},
      { repeat: { every: IFOOD_POLLING_INTERVAL_MS } },
    );
    this.logger.log(`Polling scheduled every ${IFOOD_POLLING_INTERVAL_MS}ms`);
  }
}
