import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { DatabaseModule } from "./database";
import { AuthModule, AuthMiddleware } from "./auth";
import { TenantModule } from "./tenant";
import { IFoodModule } from "./ifood";
import { OrdersModule } from "./orders";
import { DashboardModule } from "./dashboard";
import { WhatsAppModule } from "./whatsapp";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TenantModule,
    IFoodModule,
    OrdersModule,
    DashboardModule,
    WhatsAppModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes("api/orders");
  }
}
