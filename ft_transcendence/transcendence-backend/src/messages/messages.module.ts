import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ChatGateway } from "./chat.gateway";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway],
  exports: [MessagesService, ChatGateway],
})
export class MessagesModule {}
