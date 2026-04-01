import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database";
import { AuthModule } from "./auth";
import { TenantModule } from "./tenant";
import { IFoodModule } from "./ifood";
import { OrdersModule } from "./orders";
import { HealthController } from "./health.controller";

@Module({
  imports: [DatabaseModule, AuthModule, TenantModule, IFoodModule, OrdersModule],
  controllers: [HealthController],
})
export class AppModule {}
