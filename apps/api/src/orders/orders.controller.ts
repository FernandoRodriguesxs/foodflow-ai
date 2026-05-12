import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { TenantGuard } from "@tenant/tenant.guard";
import { StoreId } from "@shared/value-objects/store-id";
import type { AuthenticatedUser } from "@auth/auth.types";
import { OrderListingService } from "./order-listing.service";
import { parseOrderListQuery } from "./order-list.parser";
import type {
  OrderListQueryInput,
  OrderListResult,
} from "./order-list.types";

type AuthenticatedRequest = FastifyRequest & { user: AuthenticatedUser };

@Controller("api/orders")
@UseGuards(TenantGuard)
export class OrdersController {
  constructor(private readonly listingService: OrderListingService) {}

  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
    @Query() query: OrderListQueryInput,
  ): Promise<OrderListResult> {
    const storeId = StoreId.create(request.user.storeId);
    const filters = parseOrderListQuery(query);
    return this.listingService.listOrders(storeId, filters);
  }
}
