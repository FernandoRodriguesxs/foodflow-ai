import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database";
import { AuthModule } from "./auth";
import { TenantModule } from "./tenant";
import { IFoodModule } from "./ifood";
import { OrdersModule } from "./orders";
import { DashboardModule } from "./dashboard";
import { HealthController } from "./health.controller";

@Module({
  imports: [DatabaseModule, AuthModule, TenantModule, IFoodModule, OrdersModule, DashboardModule],
  controllers: [HealthController],
})
export class AppModule {}
