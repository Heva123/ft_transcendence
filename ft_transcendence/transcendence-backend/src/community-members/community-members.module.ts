import { Module } from "@nestjs/common";
import { PermissionsModule } from "../permissions/permissions.module";
import { MessagesModule } from "../messages/messages.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CommunityMembersController } from "./community-members.controller";
import { CommunityMembersService } from "./community-members.service";

@Module({
  imports: [
    PermissionsModule,
    MessagesModule,
    NotificationsModule,
  ],
  controllers: [CommunityMembersController],
  providers: [CommunityMembersService],
})
export class CommunityMembersModule {}
