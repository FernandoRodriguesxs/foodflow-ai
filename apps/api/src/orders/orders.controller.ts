import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { TenantGuard } from "@tenant/tenant.guard";
import { StoreId } from "@shared/value-objects/store-id";
import { OrderId } from "@shared/value-objects/order-id";
import type { AuthenticatedUser } from "@auth/auth.types";
import { OrderListingService } from "./order-listing.service";
import { StatusTransitionService } from "./status-transition.service";
import { parseOrderListQuery } from "./order-list.parser";
import { parseUpdateStatusBody } from "./update-status.parser";
import { runStatusTransition } from "./update-status.helpers";
import type { OrderListQueryInput, OrderListResult } from "./order-list.types";
import type { CreatedOrder } from "./orders.types";

type AuthenticatedRequest = FastifyRequest & { user: AuthenticatedUser };

@Controller("api/orders")
@UseGuards(TenantGuard)
export class OrdersController {
  constructor(
    private readonly listingService: OrderListingService,
    private readonly statusTransitionService: StatusTransitionService,
  ) {}

  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
    @Query() query: OrderListQueryInput,
  ): Promise<OrderListResult> {
    const storeId = StoreId.create(request.user.storeId);
    const filters = parseOrderListQuery(query);
    return this.listingService.listOrders(storeId, filters);
  }

  @Patch(":id/status")
  async updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<CreatedOrder> {
    const storeId = StoreId.create(request.user.storeId);
    const orderId = OrderId.create(id);
    const { status } = parseUpdateStatusBody(body);
    return runStatusTransition(this.statusTransitionService, storeId, orderId, status);
  }
}
