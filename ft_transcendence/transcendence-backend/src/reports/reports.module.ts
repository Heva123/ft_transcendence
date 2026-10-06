import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [PermissionsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
