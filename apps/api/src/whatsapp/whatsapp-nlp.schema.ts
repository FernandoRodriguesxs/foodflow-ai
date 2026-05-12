import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  notes: z.string().min(1).optional(),
});

export const parsedOrderResponseSchema = z.object({
  is_order: z.boolean(),
  items: z.array(itemSchema).default([]),
  customer_name: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export type ParsedOrderResponse = z.infer<typeof parsedOrderResponseSchema>;
