import { Module } from "@nestjs/common";
import { DashboardGateway } from "./dashboard.gateway";
import { SocketAuthenticationService } from "./socket-authentication.service";

@Module({
  providers: [DashboardGateway, SocketAuthenticationService],
  exports: [DashboardGateway],
})
export class DashboardModule {}
