import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ORDER_STATUS_VALUES } from "@database/schemas/enum-values";
import type { StatusValue } from "./orders.types";

const updateStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
});

export interface UpdateStatusInput {
  readonly status: StatusValue;
}

export function parseUpdateStatusBody(raw: unknown): UpdateStatusInput {
  const result = updateStatusBodySchema.safeParse(raw);
  if (!result.success) {
    throw new BadRequestException(result.error.issues[0]?.message ?? "invalid request body");
  }
  return Object.freeze({ status: result.data.status });
}
