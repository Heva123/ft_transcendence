import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateMessageDto } from "./dto/create-message.dto";
import { MessagesService } from "./messages.service";

@UseGuards(JwtAuthGuard)
@Controller("channels/:channelId/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param("channelId", ParseUUIDPipe) channelId: string,
  ) {
    return this.messagesService.findAll(channelId, user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param("channelId", ParseUUIDPipe) channelId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(channelId, user.id, dto);
  }
}
