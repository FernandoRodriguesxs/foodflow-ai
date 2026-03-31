import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database";
import { AuthModule } from "./auth";
import { HealthController } from "./health.controller";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
