import { Module } from "@nestjs/common";
import { CommunitiesController } from "./communities.controller";
import { CommunitiesService } from "./communities.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { MessagesModule } from "../messages/messages.module";

@Module({
  imports: [NotificationsModule, MessagesModule],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
