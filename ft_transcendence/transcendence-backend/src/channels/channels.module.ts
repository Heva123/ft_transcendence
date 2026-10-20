import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { MessagesModule } from "../messages/messages.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";

@Module({
  imports: [
    PermissionsModule,
    MessagesModule,
    NotificationsModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
