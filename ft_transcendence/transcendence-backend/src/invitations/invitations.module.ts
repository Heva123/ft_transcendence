import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { PermissionsModule } from "../permissions/permissions.module";
import {
  CommunityInvitationsController,
  MyInvitationsController,
} from "./invitations.controller";
import { InvitationsService } from "./invitations.service";

@Module({
  imports: [PermissionsModule, NotificationsModule],
  controllers: [CommunityInvitationsController, MyInvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
