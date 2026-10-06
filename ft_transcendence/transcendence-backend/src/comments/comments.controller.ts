import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CommentsService } from "./comments.service";

@UseGuards(JwtAuthGuard)
@Controller("posts/:postId/comments")
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
  ) {
    return this.comments.list(user.id, postId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(user.id, postId, dto);
  }

  @Patch(":commentId")
  update(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.comments.update(user.id, postId, commentId, dto);
  }

  @Delete(":commentId")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ) {
    return this.comments.remove(user.id, postId, commentId);
  }
}
