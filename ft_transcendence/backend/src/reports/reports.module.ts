import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { MessagesModule } from "../messages/messages.module";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [PermissionsModule, NotificationsModule, MessagesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
